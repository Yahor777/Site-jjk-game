export interface SaveData {
  version: 1;
  shards: number;
  bestRoom: number;
  wins: number;
  sound: boolean;
  vibration: boolean;
}

const KEY = 'curse-breaker-save-v1';
const defaults: SaveData = { version: 1, shards: 0, bestRoom: 0, wins: 0, sound: true, vibration: true };

export class SaveSystem {
  static load(): SaveData {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? '') as Partial<SaveData>;
      return { ...defaults, ...parsed, version: 1 };
    } catch { return { ...defaults }; }
  }

  static write(data: SaveData): void { localStorage.setItem(KEY, JSON.stringify(data)); }
  static vibrate(pattern: number | number[]): void {
    if (this.load().vibration && navigator.vibrate) navigator.vibrate(pattern);
  }
}
