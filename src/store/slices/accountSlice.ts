import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DatabaseService } from '../../services/database/DatabaseService';
import { Account } from '../../types';

interface AccountState {
  data: Account | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAccount = createAsyncThunk('account/fetch', async () => {
  return await DatabaseService.getAccount();
});

export const resetAccount = createAsyncThunk('account/reset', async (initialBalance: number) => {
  await DatabaseService.updateAccountBalance(initialBalance);
  return await DatabaseService.getAccount();
});

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(resetAccount.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default accountSlice.reducer;
