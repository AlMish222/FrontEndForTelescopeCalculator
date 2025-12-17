import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { ModelsStar } from "../api/Api";

interface StarsState {
  searchValue: string;
  stars: ModelsStar[];
  loading: boolean;
}

const initialState: StarsState = {
  searchValue: "",
  stars: [],
  loading: false,
};

function mapStarFromApi(star: any): ModelsStar {
  return {
    starID: star.StarID,
    starName: star.StarName,
    shortDescription: star.ShortDescription,
    description: star.Description,
    imageURL: star.ImageURL,
    isActive: star.IsActive,
    ra: star.RA,
    dec: star.Dec,
    observations: star.Observations,
  };
}

export const getStarsList = createAsyncThunk(
  "stars/getStarsList",
  async (_, { getState, rejectWithValue }) => {
    const { stars }: any = getState();

    try {
      const response = stars.searchValue
        ? await api.stars.starsList({ star_name: stars.searchValue })
        : await api.stars.starsList();

      return response.data.map(mapStarFromApi);
    } catch {
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
      });
  },
});

export const { setSearchValue, resetSearchValue } = starsSlice.actions;
export default starsSlice.reducer;
