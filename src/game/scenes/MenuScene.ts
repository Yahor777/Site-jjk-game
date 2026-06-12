import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { SaveSystem } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create(): void {
    this.cameras.main.setBackgroundColor('#070914');
    this.drawBackground();
    const save = SaveSystem.load();
    this.add.text(64, 54, 'CURSE', { fontFamily: 'Russo One, Arial', fontSize: '72px', color: '#eef5ff', stroke: '#0b1022', strokeThickness: 8 }).setDepth(2);
    this.add.text(70, 124, 'BREAKER', { fontFamily: 'Russo One, Arial', fontSize: '66px', color: '#48f0d1', stroke: '#0b1022', strokeThickness: 8 }).setDepth(2);
    this.add.text(72, 198, 'NIGHT DISTRICT', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '17px', letterSpacing: 8, color: '#8c9cba' }).setDepth(2);
    this.add.text(72, 260, 'Станьте экзорцистом. Прорвитесь через\nзаражённый район. Победите Источник.', { fontFamily: 'Arial', fontSize: '17px', color: '#b7c3d9', lineSpacing: 8 }).setDepth(2);

    const play = this.add.rectangle(72, 354, 254, 64, 0x48f0d1).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(3);
    const playText = this.add.text(199, 386, 'НАЧАТЬ ЗАБЕГ  ›', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#07121a' }).setOrigin(0.5).setDepth(4);
    play.on('pointerover', () => play.setFillStyle(0x8dffe9)); play.on('pointerout', () => play.setFillStyle(0x48f0d1));
    play.on('pointerdown', () => { this.cameras.main.flash(160, 72, 240, 209); this.time.delayedCall(120, () => this.scene.start('GameScene')); });
    playText.setInteractive().on('pointerdown', () => play.emit('pointerdown'));

    this.add.text(72, 445, `ОСКОЛКИ  ◆ ${save.shards}     ЛУЧШАЯ КОМНАТА  ${save.bestRoom}`, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: '#7f90ae' });
    this.add.text(72, 480, 'ПК: A/D · SPACE · J атака · K рывок · L техника', { fontFamily: 'Arial', fontSize: '12px', color: '#4f607e' });
    this.add.text(888, 506, 'v1.0', { fontFamily: 'Arial', fontSize: '11px', color: '#52617a' });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x070914, 0x111a35, 0x070914, 0x091126, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 420; x < 980; x += 58) {
      const height = Phaser.Math.Between(80, 270);
      g.fillStyle(0x10182e, 0.95).fillRect(x, GAME_HEIGHT - height, 46, height);
      g.fillStyle(0x48f0d1, 0.12);
      for (let y = GAME_HEIGHT - height + 20; y < GAME_HEIGHT - 25; y += 28) g.fillRect(x + 9, y, 6, 11).fillRect(x + 28, y, 6, 11);
    }
    g.fillStyle(0x48f0d1, 0.04).fillCircle(760, 180, 260);
    g.lineStyle(2, 0x8c5cff, 0.35);
    for (let r = 70; r < 240; r += 38) g.strokeCircle(760, 210, r);
    this.add.circle(760, 218, 79, 0x7d2d68, 0.72).setStrokeStyle(3, 0xe14a80, 0.8);
    this.add.circle(730, 205, 11, 0xffd8e6).setDepth(1); this.add.circle(790, 205, 11, 0xffd8e6).setDepth(1);
    this.add.circle(730, 207, 5, 0x18081b).setDepth(1); this.add.circle(790, 207, 5, 0x18081b).setDepth(1);
    this.add.arc(760, 235, 30, 10, 170, false, 0x230b27).setDepth(1);
    g.fillStyle(0x090b18, 0.8).fillRect(0, 515, 960, 25);
  }
}
