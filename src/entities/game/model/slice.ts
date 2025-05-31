import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface GameState {
  isSpinning: boolean;
  spinResult: number | null;
  showWinPopup: boolean;
  winningSymbolId: number | null;
  spinDuration: number;
  isAnimationComplete: boolean;
}

const initialState: GameState = {
  isSpinning: false,
  spinResult: null,
  showWinPopup: false,
  winningSymbolId: null,
  spinDuration: 5,
  isAnimationComplete: true
};

export const SYMBOL_URLS = [
  '/symbols/symbol1.png',
  '/symbols/symbol2.png',
  '/symbols/symbol3.png',
  '/symbols/symbol4.png',
  '/symbols/symbol5.png',
  '/symbols/symbol6.png',
  '/symbols/symbol7.png',
  '/symbols/symbol8.png',
];

export const fetchSpinResult = createAsyncThunk(
  'game/fetchSpinResult',
  async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/spin');
      console.log('Server response:', response.data);
      
      // Проверяем, что symbolId в допустимом диапазоне
      const symbolId = response.data.symbolId;
      if (symbolId === undefined || symbolId === null) {
        console.error('Server returned invalid symbolId:', symbolId);
        return Math.floor(Math.random() * SYMBOL_URLS.length);
      }
      
      // Убеждаемся, что symbolId в пределах массива картинок
      const validSymbolId = Math.max(0, Math.min(symbolId, SYMBOL_URLS.length - 1));
      if (validSymbolId !== symbolId) {
        console.warn('Server returned out of range symbolId:', symbolId, 'using:', validSymbolId);
      }
      
      return validSymbolId;
    } catch (err) {
      console.error('Error fetching spin result:', err);
      return Math.floor(Math.random() * SYMBOL_URLS.length);
    }
  }
);

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startSpin: (state: GameState) => {
      if (!state.isSpinning && state.isAnimationComplete) {
        state.isAnimationComplete = false;
      }
    },
    completeSpin: (state: GameState) => {
      state.isSpinning = false;
      state.isAnimationComplete = true;
    },
    showWin: (state: GameState, action: PayloadAction<number>) => {
      // Проверяем, что индекс в допустимом диапазоне
      const symbolId = Math.max(0, Math.min(action.payload, SYMBOL_URLS.length - 1));
      state.winningSymbolId = symbolId;
      state.showWinPopup = true;
    },
    hideWin: (state: GameState) => {
      state.showWinPopup = false;
      state.winningSymbolId = null;
    },
    setSpinDuration: (state: GameState, action: PayloadAction<number>) => {
      state.spinDuration = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpinResult.pending, (state: GameState) => {
        state.spinResult = null;
        state.showWinPopup = false;
        state.winningSymbolId = null;
      })
      .addCase(fetchSpinResult.fulfilled, (state: GameState, action: PayloadAction<number>) => {
        console.log('Setting spin result:', action.payload);
        state.spinResult = action.payload;
        state.isSpinning = true;
      });
  },
});

export const { 
  startSpin, 
  completeSpin, 
  showWin, 
  hideWin,
  setSpinDuration 
} = gameSlice.actions;

export default gameSlice.reducer; 