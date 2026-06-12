import Phaser from 'phaser';
import type { ControlState } from '../../ui/TouchControls';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp = 100;
  maxHp = 100;
  energy = 0;
  damage = 18;
  facing = 1;
  invulnerableUntil = 0;
  private lastDash = 0;
  private lastAttack = 0;
  private lastSkill = 0;
  private jumpHeld = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setCollideWorldBounds(true).setDepth(10).setDragX(1100).setMaxVelocity(470, 900);
    this.body?.setSize(28, 48).setOffset(6, 4);
  }

  updateControls(state: ControlState, keys: Record<string, Phaser.Input.Keyboard.Key>): void {
    const now = this.scene.time.now;
    const left = state.left || keys.left.isDown || keys.altLeft.isDown;
    const right = state.right || keys.right.isDown || keys.altRight.isDown;
    const onFloor = (this.body as Phaser.Physics.Arcade.Body).blocked.down;
    if (left !== right) {
      this.setAccelerationX(left ? -1250 : 1250); this.facing = left ? -1 : 1; this.setFlipX(left);
    } else this.setAccelerationX(0);

    const jump = state.jump || keys.jump.isDown || keys.altJump.isDown;
    if (jump && !this.jumpHeld && onFloor) this.setVelocityY(-580);
    this.jumpHeld = jump;

    if ((state.dash || Phaser.Input.Keyboard.JustDown(keys.dash)) && now - this.lastDash > 850) {
      this.lastDash = now; this.invulnerableUntil = now + 220; this.setVelocity(this.facing * 620, 0); this.setAccelerationX(0);
      this.setTint(0xa8fff1); this.scene.time.delayedCall(180, () => this.clearTint());
      this.emit('dash');
    }
    if ((state.attack || keys.attack.isDown) && now - this.lastAttack > 330) {
      this.lastAttack = now; this.emit('attack', this.facing, this.damage);
    }
    if ((state.skill || keys.skill.isDown) && now - this.lastSkill > 700 && this.energy >= 25) {
      this.lastSkill = now; this.energy -= 25; this.emit('skill', this.facing, this.damage * 1.25);
    }
  }

  hurt(amount: number): boolean {
    if (this.scene.time.now < this.invulnerableUntil) return false;
    this.hp = Math.max(0, this.hp - amount); this.invulnerableUntil = this.scene.time.now + 700;
    this.setTint(0xff4770); this.setVelocity(-this.facing * 180, -180);
    this.scene.time.delayedCall(140, () => this.clearTint());
    return true;
  }
}
