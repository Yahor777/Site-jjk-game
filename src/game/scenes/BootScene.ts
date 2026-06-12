import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create(): void {
    this.makeTextures();
    this.scene.start('MenuScene');
  }

  private makeTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x48f0d1).fillRoundedRect(5, 3, 30, 45, 8);
    g.fillStyle(0xe7fffb).fillCircle(20, 12, 7);
    g.fillStyle(0x17264f).fillRect(9, 23, 22, 15);
    g.lineStyle(3, 0x8c5cff).strokeCircle(20, 22, 16);
    g.generateTexture('player', 40, 52); g.clear();

    g.fillStyle(0x7d2d68).fillCircle(24, 24, 21);
    g.fillStyle(0xe64f7e).fillTriangle(5, 17, 12, 0, 19, 17).fillTriangle(29, 17, 36, 0, 43, 17);
    g.fillStyle(0xffd3df).fillCircle(17, 21, 4).fillCircle(31, 21, 4);
    g.fillStyle(0x16091a).fillCircle(17, 22, 2).fillCircle(31, 22, 2);
    g.generateTexture('enemy', 48, 48); g.clear();

    g.fillStyle(0xb247ee).fillCircle(18, 18, 15);
    g.lineStyle(3, 0xedbaff).strokeCircle(18, 18, 12);
    g.fillStyle(0xffffff).fillCircle(13, 15, 3).fillCircle(23, 15, 3);
    g.generateTexture('flyer', 36, 36); g.clear();

    g.fillStyle(0xef4770).fillCircle(7, 7, 7); g.generateTexture('orb', 14, 14); g.clear();
    g.fillStyle(0x52ffe0).fillCircle(8, 8, 8); g.generateTexture('bolt', 16, 16); g.clear();

    g.fillStyle(0x111b35).fillRoundedRect(0, 0, 64, 64, 10);
    g.lineStyle(2, 0x26365c).strokeRoundedRect(1, 1, 62, 62, 10);
    g.lineStyle(1, 0x1d2b4c).lineBetween(0, 20, 64, 20).lineBetween(22, 0, 22, 64);
    g.generateTexture('tile', 64, 64); g.destroy();
  }
}
