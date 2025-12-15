import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

interface TelescopeObservationDraftState {
  app_id: number | null;
  count: number;
}

const initialState: TelescopeObservationDraftState = {
  app_id: null,
  count: 0,
};

/**
 * Получение информации о корзине пользователя
 * GET /telescopeObservations/cart
 */
export const getCartInfo = createAsyncThunk(
  "telescopeObservationDraft/getCartInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.cartList();
      return response.data;
    } catch {
      return rejectWithValue("Ошибка при загрузке корзины");
    }
  }
);

const telescopeObservationDraftSlice = createSlice({
  name: "telescopeObservationDraft",
  initialState,
  reducers: {
    resetDraft(state) {
      state.app_id = null;
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCartInfo.fulfilled, (state, action) => {
      state.app_id = action.payload.telescope_observation_id;
      state.count = action.payload.count;
    });
  },
});

export const { resetDraft } = telescopeObservationDraftSlice.actions;
export default telescopeObservationDraftSlice.reducer;
