import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Star } from "../types/star";
import { STARS_MOCK } from "../mock/starsMock";

interface StarsState {
  searchValue: string;
  stars: Star[];
  loading: boolean;
}

const initialState: StarsState = {
  searchValue: "",
  stars: [],
  loading: false,
};

export const getStarsList = createAsyncThunk(
  "stars/getStarsList",
  async (_, { getState, rejectWithValue }) => {
    const { stars }: any = getState();

    try {
      const response = await api.stars.starsList({
        star_name: stars.searchValue,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue("Ошибка при загрузке звёзд");
    }
  }
);

const starsSlice = createSlice({
  name: "stars",
  initialState,
  reducers: {
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
    resetSearchValue(state) {
      state.searchValue = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStarsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStarsList.fulfilled, (state, action) => {
        state.loading = false;
        state.stars = action.payload;
      })
      .addCase(getStarsList.rejected, (state) => {
        state.loading = false;
        state.stars = STARS_MOCK.filter((star) =>
          star.StarName.toLowerCase().includes(
            state.searchValue.toLowerCase()
          )
        );
      });
  },
});

export const { setSearchValue, resetSearchValue } = starsSlice.actions;
export default starsSlice.reducer;