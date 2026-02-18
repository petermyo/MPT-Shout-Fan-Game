
export interface ShoutReward {
  id: string;
  title: string;
  amount: string;
  icon: string;
  minVolume: number; // 0 to 100 threshold
  maxVolume: number; // 0 to 100 threshold
  color: string;
}

export interface SpinSlice {
  id: string;
  title: string;
  icon: string;
  color: string;
  chance: number;
}

export interface SpinRecord {
  id: string;
  sliceId: string;
  title: string;
  amount: string;
  timestamp: number;
}

export interface AppSettings {
  shoutDuration: number; // in seconds
}

export interface AppState {
  rewards: ShoutReward[];
  history: SpinRecord[];
  settings: AppSettings;
}
