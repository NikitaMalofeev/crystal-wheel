import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface GameState {
  isSpinning: boolean;
  spinResult: number | null;
  error: string | null;
}

const initialState: GameState = {
  isSpinning: false,
  spinResult: null,
  error: null,
};

export const spinReels = createAsyncThunk(
  'game/spin',
  async () => {
    const response = await fetch('http://localhost:3001/api/spin');
    const data = await response.json();
    return data.result;
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(spinReels.pending, (state) => {
        state.isSpinning = true;
        state.error = null;
      })
      .addCase(spinReels.fulfilled, (state, action) => {
        state.isSpinning = false;
        state.spinResult = action.payload;
      })
      .addCase(spinReels.rejected, (state, action) => {
        state.isSpinning = false;
        state.error = action.error.message || 'Произошла ошибка';
      });
  },
});

export const gameReducer = gameSlice.reducer; 