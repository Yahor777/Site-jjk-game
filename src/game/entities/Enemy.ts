import Phaser from 'phaser';
import type { Player } from './Player';

export type EnemyKind = 'stalker' | 'flyer' | 'elite' | 'boss';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  readonly maxHp: number;
  readonly kind: EnemyKind;
  damage: number;
  private nextAction = 0;
  private readonly target: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: EnemyKind, target: Player) {
    super(scene, x, y, kind === 'flyer' ? 'flyer' : 'enemy');
    this.kind = kind; this.target = target;
    const stats = kind === 'boss' ? [420, 22, 1.9] : kind === 'elite' ? [110, 16, 1.35] : kind === 'flyer' ? [44, 11, 0.85] : [62, 12, 1];
    this.hp = this.maxHp = stats[0]; this.damage = stats[1];
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setScale(stats[2]).setCollideWorldBounds(true).setDepth(8);
    this.body?.setSize(kind === 'flyer' ? 32 : 40, kind === 'flyer' ? 32 : 44);
    if (kind === 'flyer') (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    if (kind === 'boss') this.setTint(0xff7096);
  }

  updateAI(): void {
    if (!this.active) return;
    const dx = this.target.x - this.x;
    const distance = Math.abs(dx);
    this.setFlipX(dx < 0);
    if (this.kind === 'flyer') {
      this.setVelocityX(Phaser.Math.Clamp(dx * 1.2, -120, 120));
      this.setVelocityY(Phaser.Math.Clamp((this.target.y - 90 - this.y) * 1.2, -80, 80));
    } else {
      this.setVelocityX(distance > 52 ? Math.sign(dx) * (this.kind === 'boss' ? 90 : 125) : 0);
    }
    if (distance < (this.kind === 'boss' ? 110 : 58) && this.scene.time.now > this.nextAction) {
      this.nextAction = this.scene.time.now + (this.kind === 'boss' ? 900 : 1150);
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(180, () => {
        if (!this.active) return;
        this.clearTint();
        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < (this.kind === 'boss' ? 125 : 70)) this.emit('strike', this.damage);
      });
    }
  }

  hit(amount: number, direction: number): boolean {
    this.hp -= amount; this.setTintFill(0xffffff); this.setVelocityX(direction * 180);
    this.scene.time.delayedCall(70, () => { if (this.active) this.clearTint(); });
    if (this.hp <= 0) { this.emit('defeated', this); this.destroy(); return true; }
    return false;
  }
}
