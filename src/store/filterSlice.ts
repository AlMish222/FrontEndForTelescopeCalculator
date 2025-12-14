import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  query: string; // значение фильтра
}

const initialState: FilterState = {
  query: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<string>) {
      state.query = action.payload; // сохраняем фильтр
    },
    resetFilter(state) {
      state.query = ""; // сброс фильтра
    },
  },
});

export const { setFilter, resetFilter } = filterSlice.actions;
export default filterSlice.reducer;