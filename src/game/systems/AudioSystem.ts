export class AudioSystem {
  private context?: AudioContext;
  private enabled = true;

  setEnabled(enabled: boolean): void { this.enabled = enabled; }
  unlock(): void {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
  }
  tone(frequency: number, duration = 0.06, volume = 0.025, type: OscillatorType = 'sine'): void {
    if (!this.enabled) return;
    this.unlock();
    const context = this.context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}
