import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, type EnemyKind } from '../entities/Enemy';
import { TouchControls } from '../../ui/TouchControls';
import { SaveSystem, type SaveData } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private controls!: TouchControls;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private hpBar!: Phaser.GameObjects.Rectangle;
  private energyBar!: Phaser.GameObjects.Rectangle;
  private roomText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private bossBar?: Phaser.GameObjects.Rectangle;
  private room = 1;
  private kills = 0;
  private requiredKills = 0;
  private transitioning = false;
  private choosing = false;
  private save!: SaveData;
  private readonly audio = new AudioSystem();

  constructor() { super('GameScene'); }

  create(): void {
    this.save = SaveSystem.load(); this.audio.setEnabled(this.save.sound);
    this.drawWorld();
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();
    this.player = new Player(this, 130, 400);
    this.enemies = this.add.group();
    this.projectiles = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, (_, enemyObject) => this.contactEnemy(enemyObject as Enemy));
    this.createInput(); this.createHud(); this.bindPlayerEvents();
    this.controls = new TouchControls(this);
    this.input.once('pointerdown', () => this.audio.unlock());
    this.spawnRoom();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.controls.destroy());
  }

  update(): void {
    if (this.choosing || !this.player.active) return;
    this.player.updateControls(this.controls.state, this.keys);
    this.enemies.getChildren().forEach((child) => (child as Enemy).updateAI());
    this.updateHud();
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) this.scene.pause();
  }

  private drawWorld(): void {
    const g = this.add.graphics().setDepth(-5);
    g.fillGradientStyle(0x080b18, 0x101b34, 0x101125, 0x080a14, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0x111a30).fillCircle(790, 118, 78); g.lineStyle(2, 0x7352b5, 0.28).strokeCircle(790, 118, 94);
    for (let x = 0; x < GAME_WIDTH; x += 70) {
      const h = Phaser.Math.Between(65, 185); g.fillStyle(0x0c1326).fillRect(x, 430 - h, 58, h);
      g.fillStyle(0x45d8c1, 0.08);
      for (let y = 430 - h + 18; y < 415; y += 30) g.fillRect(x + 10, y, 8, 12).fillRect(x + 34, y, 8, 12);
    }
    g.lineStyle(1, 0x4b5a7a, 0.14);
    for (let x = 0; x < 960; x += 48) g.lineBetween(x, 0, x + 190, 540);
  }

  private createPlatforms(): void {
    for (let x = 32; x < 960; x += 64) this.platforms.create(x, 512, 'tile');
    [270, 334].forEach((x) => this.platforms.create(x, 390, 'tile'));
    [590, 654].forEach((x) => this.platforms.create(x, 330, 'tile'));
    [760, 824].forEach((x) => this.platforms.create(x, 420, 'tile'));
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input unavailable');
    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      altLeft: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), altRight: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), altJump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), attack: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      dash: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K), skill: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };
  }

  private createHud(): void {
    this.add.rectangle(34, 28, 270, 74, 0x090d1d, 0.86).setOrigin(0).setStrokeStyle(1, 0x344668).setScrollFactor(0).setDepth(80);
    this.add.text(51, 40, 'ЭКЗОРЦИСТ', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '11px', color: '#8fa0be' }).setScrollFactor(0).setDepth(81);
    this.add.rectangle(51, 62, 234, 12, 0x281324).setOrigin(0).setScrollFactor(0).setDepth(81);
    this.hpBar = this.add.rectangle(51, 62, 234, 12, 0xef4770).setOrigin(0).setScrollFactor(0).setDepth(82);
    this.add.rectangle(51, 84, 234, 7, 0x102c38).setOrigin(0).setScrollFactor(0).setDepth(81);
    this.energyBar = this.add.rectangle(51, 84, 0, 7, 0x48f0d1).setOrigin(0).setScrollFactor(0).setDepth(82);
    this.roomText = this.add.text(480, 32, '', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: '#aab8d0' }).setOrigin(0.5).setScrollFactor(0).setDepth(81);
    this.statusText = this.add.text(480, 58, '', { fontFamily: 'Russo One, Arial', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(81);
  }

  private bindPlayerEvents(): void {
    this.player.on('attack', (facing: number, damage: number) => {
      this.audio.tone(150, 0.05, 0.035, 'sawtooth');
      const slash = this.add.arc(this.player.x + facing * 34, this.player.y, 42, facing > 0 ? 280 : 100, facing > 0 ? 80 : 260, false).setStrokeStyle(8, 0xeffffa, 0.8).setDepth(15);
      this.tweens.add({ targets: slash, alpha: 0, scale: 1.35, duration: 110, onComplete: () => slash.destroy() });
      this.enemies.getChildren().forEach((child) => {
        const enemy = child as Enemy;
        const dx = enemy.x - this.player.x;
        if (Math.abs(dx) < 78 && Math.abs(enemy.y - this.player.y) < 72 && Math.sign(dx || facing) === facing) this.damageEnemy(enemy, damage, facing);
      });
    });
    this.player.on('skill', (facing: number, damage: number) => {
      this.audio.tone(520, 0.14, 0.04, 'triangle');
      const bolt = this.physics.add.image(this.player.x + facing * 28, this.player.y, 'bolt').setVelocityX(facing * 620).setDepth(12);
      (bolt.body as Phaser.Physics.Arcade.Body).setAllowGravity(false); this.projectiles.add(bolt);
      this.physics.add.overlap(bolt, this.enemies, (projectile, enemy) => { this.damageEnemy(enemy as Enemy, damage, facing); projectile.destroy(); });
      this.time.delayedCall(1300, () => bolt.destroy());
    });
    this.player.on('dash', () => { this.audio.tone(260, 0.08, 0.02, 'square'); SaveSystem.vibrate(12); });
  }

  private spawnRoom(): void {
    this.transitioning = false; this.kills = 0;
    const isBoss = this.room === 6;
    this.requiredKills = isBoss ? 1 : Math.min(2 + this.room, 5);
    this.roomText.setText(isBoss ? 'ФИНАЛЬНАЯ ПЕЧАТЬ' : `РАЙОН 01  ·  КОМНАТА ${this.room}/6`);
    this.statusText.setText(isBoss ? 'ИСТОЧНИК ПРОКЛЯТИЯ' : 'ОЧИСТИТЕ АРЕНУ');
    this.player.setPosition(120, 430).setVelocity(0, 0);
    if (isBoss) this.spawnEnemy(750, 380, 'boss');
    else for (let i = 0; i < this.requiredKills; i++) {
      const kind: EnemyKind = this.room >= 4 && i === 0 ? 'elite' : i % 3 === 2 ? 'flyer' : 'stalker';
      this.spawnEnemy(520 + (i % 3) * 130, kind === 'flyer' ? 230 : 410, kind);
    }
  }

  private spawnEnemy(x: number, y: number, kind: EnemyKind): void {
    const enemy = new Enemy(this, x, y, kind, this.player); this.enemies.add(enemy);
    enemy.on('strike', (damage: number) => this.hurtPlayer(damage));
    enemy.on('defeated', () => this.enemyDefeated(enemy));
    if (kind === 'boss') {
      this.add.rectangle(280, 114, 400, 10, 0x301224).setOrigin(0).setDepth(80);
      this.bossBar = this.add.rectangle(280, 114, 400, 10, 0xef4770).setOrigin(0).setDepth(81);
    }
  }

  private damageEnemy(enemy: Enemy, amount: number, direction: number): void {
    if (!enemy.active) return;
    const killed = enemy.hit(amount, direction); this.player.energy = Math.min(100, this.player.energy + (killed ? 12 : 5));
    this.audio.tone(killed ? 110 : 210, 0.06, 0.025, 'square'); SaveSystem.vibrate(killed ? [15, 20, 25] : 8);
    this.popup(enemy.x, enemy.y - 35, `-${Math.round(amount)}`, 0xffffff);
    if (enemy.kind === 'boss' && this.bossBar) this.bossBar.width = 400 * Math.max(0, enemy.hp / enemy.maxHp);
  }

  private contactEnemy(enemy: Enemy): void {
    if (!enemy.active) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y > 180 && this.player.y < enemy.y - 15) {
      this.damageEnemy(enemy, this.player.damage * 0.7, this.player.x < enemy.x ? 1 : -1); this.player.setVelocityY(-330);
    }
  }

  private hurtPlayer(damage: number): void {
    if (!this.player.hurt(damage)) return;
    this.audio.tone(75, 0.14, 0.05, 'sawtooth'); SaveSystem.vibrate([30, 25, 30]); this.cameras.main.shake(100, 0.008);
    if (this.player.hp <= 0) this.gameOver();
  }


  private enemyDefeated(enemy: Enemy): void {
    this.kills++; this.popup(enemy.x, enemy.y, '+ ОСКОЛОК', 0x48f0d1);
    if (this.kills >= this.requiredKills && !this.transitioning) {
      this.transitioning = true;
      if (this.room === 6) this.victory();
      else this.time.delayedCall(650, () => this.showUpgrade());
    }
  }

  private showUpgrade(): void {
    this.choosing = true; this.physics.pause();
    const shade = this.add.rectangle(0, 0, 960, 540, 0x03050c, 0.86).setOrigin(0).setDepth(100);
    const title = this.add.text(480, 105, 'ВЫБЕРИТЕ ПЕЧАТЬ', { fontFamily: 'Russo One, Arial', fontSize: '28px', color: '#ffffff' }).setOrigin(0.5).setDepth(101);
    const subtitle = this.add.text(480, 142, 'Усиление действует до конца забега', { fontFamily: 'Arial', fontSize: '13px', color: '#8290aa' }).setOrigin(0.5).setDepth(101);
    const upgrades = [
      { icon: '✦', name: 'ОСТРАЯ ВОЛЯ', text: '+25% к урону', apply: () => { this.player.damage *= 1.25; } },
      { icon: '♥', name: 'ЖИВАЯ КРОВЬ', text: '+30 здоровья', apply: () => { this.player.maxHp += 30; this.player.hp = this.player.maxHp; } },
      { icon: '◈', name: 'ПОТОК ЭНЕРГИИ', text: 'Полная энергия', apply: () => { this.player.energy = 100; } }
    ];
    const objects: Phaser.GameObjects.GameObject[] = [shade, title, subtitle];
    upgrades.forEach((upgrade, index) => {
      const x = 204 + index * 278;
      const card = this.add.rectangle(x, 285, 235, 220, 0x10182e).setStrokeStyle(2, index === 1 ? 0xef4770 : 0x48f0d1, 0.7).setDepth(101).setInteractive();
      const icon = this.add.text(x, 228, upgrade.icon, { fontFamily: 'Arial', fontSize: '45px', color: index === 1 ? '#ef4770' : '#48f0d1' }).setOrigin(0.5).setDepth(102);
      const name = this.add.text(x, 290, upgrade.name, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: '#ffffff' }).setOrigin(0.5).setDepth(102);
      const text = this.add.text(x, 329, upgrade.text, { fontFamily: 'Arial', fontSize: '13px', color: '#9daac1' }).setOrigin(0.5).setDepth(102);
      card.on('pointerover', () => card.setFillStyle(0x1b2948));
      card.on('pointerdown', () => { upgrade.apply(); objects.forEach((object) => object.destroy()); this.choosing = false; this.room++; this.physics.resume(); this.spawnRoom(); });
      objects.push(card, icon, name, text);
    });
  }

  private updateHud(): void {
    this.hpBar.width = 234 * (this.player.hp / this.player.maxHp);
    this.energyBar.width = 234 * (this.player.energy / 100);
  }

  private popup(x: number, y: number, text: string, color: number): void {
    const label = this.add.text(x, y, text, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: `#${color.toString(16).padStart(6, '0')}` }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: label, y: y - 35, alpha: 0, duration: 650, onComplete: () => label.destroy() });
  }

  private gameOver(): void { this.finish(false); }
  private victory(): void { this.finish(true); }

  private finish(won: boolean): void {
    this.choosing = true; this.physics.pause();
    const reward = won ? 25 : Math.max(1, this.room * 2);
    this.save.shards += reward; this.save.bestRoom = Math.max(this.save.bestRoom, this.room); if (won) this.save.wins++; SaveSystem.write(this.save);
    this.add.rectangle(0, 0, 960, 540, 0x040611, 0.92).setOrigin(0).setDepth(110);
    this.add.text(480, 175, won ? 'ПЕЧАТЬ РАЗРУШЕНА' : 'ЭКЗОРЦИСТ ПАЛ', { fontFamily: 'Russo One, Arial', fontSize: '38px', color: won ? '#48f0d1' : '#ef4770' }).setOrigin(0.5).setDepth(111);
    this.add.text(480, 232, `Добыто осколков:  ◆ ${reward}`, { fontFamily: 'Arial', fontSize: '17px', color: '#c0cbe0' }).setOrigin(0.5).setDepth(111);
    const button = this.add.rectangle(480, 330, 250, 58, 0x48f0d1).setDepth(111).setInteractive();
    this.add.text(480, 330, 'ВЕРНУТЬСЯ В УБЕЖИЩЕ', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: '#07121a' }).setOrigin(0.5).setDepth(112);
    button.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
