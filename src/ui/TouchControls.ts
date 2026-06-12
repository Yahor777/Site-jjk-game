import Phaser from 'phaser';

export interface ControlState { left: boolean; right: boolean; jump: boolean; attack: boolean; dash: boolean; skill: boolean; }

export class TouchControls {
  readonly state: ControlState = { left: false, right: false, jump: false, attack: false, dash: false, skill: false };
  private readonly scene: Phaser.Scene;
  private readonly objects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.directionButton(82, 458, '◀', 'left');
    this.directionButton(166, 458, '▶', 'right');
    this.actionButton(870, 446, 37, 'АТК', 'attack', 0xef4770);
    this.actionButton(792, 472, 31, 'ПРЖ', 'jump', 0x48f0d1);
    this.actionButton(714, 464, 27, 'РЫВ', 'dash', 0x8c5cff);
    this.actionButton(884, 362, 27, 'ТЕХ', 'skill', 0x45a9ff);
  }

  private directionButton(x: number, y: number, label: string, key: 'left' | 'right'): void {
    const circle = this.scene.add.circle(x, y, 36, 0x152343, 0.68).setStrokeStyle(2, 0x5f729d, 0.8).setScrollFactor(0).setDepth(90).setInteractive();
    const text = this.scene.add.text(x, y - 2, label, { fontFamily: 'Arial', fontSize: '25px', color: '#b8c8e8' }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
    this.bind(circle, key);
    this.objects.push(circle, text);
  }

  private actionButton(x: number, y: number, radius: number, label: string, key: keyof ControlState, color: number): void {
    const circle = this.scene.add.circle(x, y, radius, color, 0.22).setStrokeStyle(2, color, 0.9).setScrollFactor(0).setDepth(90).setInteractive();
    const text = this.scene.add.text(x, y, label, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: `${Math.max(10, radius / 2.4)}px`, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
    this.bind(circle, key);
    this.objects.push(circle, text);
  }

  private bind(object: Phaser.GameObjects.Arc, key: keyof ControlState): void {
    object.on('pointerdown', () => { this.state[key] = true; object.setScale(0.9); });
    object.on('pointerup', () => { this.state[key] = false; object.setScale(1); });
    object.on('pointerout', () => { this.state[key] = false; object.setScale(1); });
  }

  destroy(): void { this.objects.forEach((object) => object.destroy()); }
}
