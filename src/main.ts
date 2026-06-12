import Phaser from 'phaser';
import { registerSW } from 'virtual:pwa-register';
import './style.css';
import { gameConfig } from './game/config';

registerSW({ immediate: true });
const game = new Phaser.Game(gameConfig);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.scene.pause('GameScene');
  else if (game.scene.isPaused('GameScene')) game.scene.resume('GameScene');
});
window.addEventListener('contextmenu', (event) => event.preventDefault());
