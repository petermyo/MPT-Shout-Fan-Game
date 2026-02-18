
import { ShoutReward } from './types';

export const COLORS = {
  MPT_YELLOW: '#FFD100',
  MPT_BLUE: '#005BAA',
  WHITE: '#FFFFFF',
  DARK_BLUE: '#003d73',
  LIGHT_BLUE: '#337cbb',
  DANGER: '#EF4444'
};

export const KEYWORDS = ["MPT", "HtawB", "Hti Pauk", "GO!", "WINNER", "VOICE POWER"];

export const INITIAL_REWARDS: ShoutReward[] = [
  { id: '6', title: 'Pen', amount: '250', icon: '🖊️', minVolume: 10, maxVolume: 25, color: COLORS.LIGHT_BLUE },
  { id: '5', title: 'Book', amount: '2500', icon: '📖', minVolume: 25, maxVolume: 40, color: COLORS.MPT_YELLOW },
  { id: '1', title: '500MB', amount: '1500', icon: '📶', minVolume: 40, maxVolume: 55, color: COLORS.WHITE },
  { id: '2', title: '1 GB', amount: '3000', icon: '🌐', minVolume: 55, maxVolume: 70, color: COLORS.MPT_YELLOW },
  { id: '3', title: '2 GB', amount: '5500', icon: '🚀', minVolume: 70, maxVolume: 85, color: COLORS.MPT_BLUE },
  { id: '4', title: '10 GB', amount: '15000', icon: '⚡', minVolume: 85, maxVolume: 100, color: COLORS.MPT_YELLOW },
];
