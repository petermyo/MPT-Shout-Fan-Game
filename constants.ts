
import { ShoutReward } from './types';

export const COLORS = {
  MPT_YELLOW: '#FFD100',
  MPT_BLUE: '#005BAA',
  WHITE: '#FFFFFF',
  DARK_BLUE: '#003d73',
  LIGHT_BLUE: '#337cbb',
  DANGER: '#EF4444'
};

export const KEYWORDS = ["MPT", "ထော်ဘီ", "ထိပေါက်","BOGO Offer!"];

export const SOUNDS = {
  TIN: 'https://www.soundjay.com/buttons_c2026/button-30.mp3',
  START: 'https://www.soundjay.com/misc_c2026/bell-ringing-05.mp3',
  TICK: 'https://www.soundjay.com/buttons_c2026/button-29.mp3'
};


export const INITIAL_REWARDS: ShoutReward[] = [
  { id: '1', title: 'NoteBook', amount: '2500', icon: '📓', minVolume: 20, maxVolume: 35, color: COLORS.MPT_YELLOW },  
  { id: '2', title: '500MB', amount: '7400', icon: '📶', minVolume: 35, maxVolume: 55, color: COLORS.LIGHT_BLUE },
  { id: '3', title: '1 GB', amount: '15000', icon: '📶', minVolume: 55, maxVolume: 85, color: COLORS.MPT_YELLOW },
  { id: '4', title: '5 GB', amount: '75000', icon: '⚡', minVolume: 85, maxVolume: 100, color: COLORS.WHITE },
];
