
import { ShoutReward, SpinRecord, AppSettings } from '../types';
import { INITIAL_REWARDS } from '../constants';

const REWARDS_KEY = 'mpt_shout_rewards';
const HISTORY_KEY = 'mpt_shout_history';
const SETTINGS_KEY = 'mpt_shout_settings';

const DEFAULT_SETTINGS: AppSettings = {
  shoutDuration: 3
};

export const dbService = {
  getRewards: (): ShoutReward[] => {
    const data = localStorage.getItem(REWARDS_KEY);
    return data ? JSON.parse(data) : INITIAL_REWARDS;
  },

  saveRewards: (rewards: ShoutReward[]) => {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getHistory: (): SpinRecord[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  addSpinRecord: (record: SpinRecord) => {
    const history = dbService.getHistory();
    const updated = [record, ...history].slice(0, 500); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  }
};
