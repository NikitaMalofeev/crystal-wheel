import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GameState {
  isSpinning: boolean;
  spinResult: number | null;
  showWinPopup: boolean;
  winningSymbolId: number | null;
  spinDuration: number;
  spinStartTime: number | null;
  isAnimationComplete: boolean;
}

const initialState: GameState = {
  isSpinning: false,
  spinResult: null,
  showWinPopup: false,
  winningSymbolId: null,
  spinDuration: 5,
  spinStartTime: null,
  isAnimationComplete: true
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startSpin: (state) => {
      if (!state.isSpinning && state.isAnimationComplete) {
        state.isSpinning = true;
        state.spinResult = Math.floor(Math.random() * 8);
        state.showWinPopup = false;
        state.winningSymbolId = null;
        state.spinStartTime = Date.now();
        state.isAnimationComplete = false;
      }
    },
    completeSpin: (state) => {
      state.isSpinning = false;
      state.isAnimationComplete = true;
      state.spinStartTime = null;
    },
    showWin: (state, action: PayloadAction<number>) => {
      state.winningSymbolId = action.payload;
      state.showWinPopup = true;
    },
    hideWin: (state) => {
      state.showWinPopup = false;
      state.winningSymbolId = null;
    },
    setSpinDuration: (state, action: PayloadAction<number>) => {
      state.spinDuration = action.payload;
    }
  }
});

export const { 
  startSpin, 
  completeSpin, 
  showWin, 
  hideWin,
  setSpinDuration 
} = gameSlice.actions;

export default gameSlice.reducer; 