import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#070914',
  render: { antialias: true, pixelArt: false, roundPixels: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1250 }, debug: false }
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 6 },
  scene: [BootScene, MenuScene, GameScene]
};
