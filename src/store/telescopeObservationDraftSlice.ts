import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import  type { 
  ModelsStar, 
  ModelsTelescopeObservation, 
  ModelsTelescopeObservationStar 
} from "../api/Api"

interface TelescopeObservationDraftState {
  app_id: number | null;
  count: number;
  observation: ModelsTelescopeObservation | null;
  loading: boolean;
  error: string | null;
}

const initialState: TelescopeObservationDraftState = {
  app_id: null,
  count: 0,
  observation: null,
  loading: false,
  error: null,
};

function mapStarFromApi(star: any, telescopeObservationStar?: any): ModelsStar & { quantity?: number; resultValue?: number }{
  return {
    starID: star.starId || star.StarID || star.starID,
    starName: star.starName || star.StarName,
    shortDescription: star.shortDescription || star.ShortDescription,
    description: star.description || star.Description,
    imageURL: star.imageUrl || star.imageURL || star.ImageURL,
    isActive: star.isActive || star.IsActive || true,
    ra: star.ra || star.RA,
    dec: star.dec || star.Dec,
    observations: star.observations || star.Observations || [],

    quantity: telescopeObservationStar?.quantity || star.quantity,
    resultValue: telescopeObservationStar?.resultValue || star.resultValue,
  };
}

function mapTelescopeObservationStarFromApi(data: any): ModelsTelescopeObservationStar {
  return {
    telescopeObservationID: data.telescopeObservationID || data.telescope_observation_id,
    starID: data.starId || data.starID,
    orderNumber: data.orderNumber || data.order_number,
    quantity: data.quantity,
    resultValue: data.resultValue || data.result_value,
    star: data.star ? mapStarFromApi(data.star, data) : undefined,
    telescopeObservation: data.telescopeObservation,
  };
}

function mapObservationFromApi(data: any): ModelsTelescopeObservation {
  const stars = (data.stars || []).map((star: any) => mapStarFromApi(star, star));
  const telescopeObservationStars = (data.telescopeObservationStars || [])
    .map(mapTelescopeObservationStarFromApi);
  
  if (telescopeObservationStars.length > 0) {
    telescopeObservationStars.forEach((tos: any) => {
      if (tos.star) {
        const existingStar = stars.find((s: any) => s.starID === tos.starID);
        if (existingStar) {
          existingStar.quantity = tos.quantity;
          existingStar.resultValue = tos.resultValue;
        }
      }
    });
  }

  return {
    telescopeObservationID: data.telescopeObservationID || data.telescope_observation_id || data.id,
    status: data.status || "draft",
    observationDate: data.observationDate,
    observerLatitude: data.observerLatitude,
    observerLongitude: data.observerLongitude,
    createdAt: data.createdAt,
    completionDate: data.completionDate,
    formationDate: data.formationDate,
    creatorID: data.creatorID,
    moderatorID: data.moderatorID,
    stars: stars,
    telescopeObservationStars: telescopeObservationStars,
    creator: data.creator,
    moderator: data.moderator,
  };
}

// 1. Получение информации о корзине
export const getCartInfo = createAsyncThunk(
  "telescopeObservationDraft/getCartInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.cartList();
      console.log("Cart info response:", response.data);
      return response.data;
    } catch {
      return rejectWithValue("Ошибка при загрузке корзины");
    }
  }
);

// 2. Получение полных данных черновика
export const getObservationDraft = createAsyncThunk(
  "telescopeObservationDraft/getObservationDraft",
  async (observationId: number, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.telescopeObservationsDetail(
        observationId
      );

      console.log("API Response for observation:", response.data);

      const mappedData = mapObservationFromApi(response.data);
      return mappedData;
    } catch {
      return rejectWithValue("Ошибка при загрузке черновика наблюдения");
    }
  }
);

// 3. Добавление звезды в черновик
export const addStarToObservation = createAsyncThunk(
  "telescopeObservationDraft/addStarToObservation",
  async (starId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.stars.postStars(starId);
      
      // После успешного добавления обновляем информацию о корзине
      dispatch(getCartInfo());
      
      return response.data;
    } catch {
      return rejectWithValue("Ошибка при добавлении звезды в наблюдение");
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
      state.observation = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCartInfo
      .addCase(getCartInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.app_id = action.payload.telescope_observation_id || null;
        state.count = action.payload.count || 0;
      })
      .addCase(getCartInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // getObservationDraft
      .addCase(getObservationDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getObservationDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.observation = action.payload;
        state.app_id = action.payload.telescopeObservationID || null;
        state.count = action.payload.stars?.length || 0;
      })
      .addCase(getObservationDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // addStarToObservation
      .addCase(addStarToObservation.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStarToObservation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addStarToObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDraft, clearError } = telescopeObservationDraftSlice.actions;
export default telescopeObservationDraftSlice.reducer;
