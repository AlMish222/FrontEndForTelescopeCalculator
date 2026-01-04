import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import  type { 
  ModelsStar, 
  ModelsTelescopeObservation, 
  ModelsTelescopeObservationStar 
} from "../api/Api"
import type { RootState } from "../store";

const LOCAL_STORAGE_KEY = 'telescope_cart';

const OBSERVATION_STATUS = {
  DRAFT: "черновик",
  SUBMITTED: "сформирован", 
  REJECTED: "отклонён",
  COMPLETED: "завершён",
  DELETED: "удалён",
};

interface ExtendedStar extends ModelsStar {
  quantity?: number;
  resultValue?: number;
}

interface TelescopeObservationDraftState {
  app_id: number | null;
  count: number;
  observation: ModelsTelescopeObservation | null;
  loading: boolean;
  error: string | null;
  isDraft: boolean;
}

const loadFromLocalStorage = (): Partial<TelescopeObservationDraftState> => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        app_id: parsed.app_id || null,
        count: parsed.count || 0,
      };
    }
  } catch (e) {
    console.error('Ошибка загрузки корзины из localStorage:', e);
  }
  return {};
};

const initialState: TelescopeObservationDraftState = {
  app_id: null,
  count: 0,
  observation: null,
  loading: false,
  error: null,
  isDraft: false,
  ...loadFromLocalStorage(),
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
        const existingStar = stars.find((s: ExtendedStar) => s.starID === tos.starID);
        if (existingStar) {
          existingStar.quantity = tos.quantity;
          existingStar.resultValue = tos.resultValue;
        }
      }
    });
  }

  return {
    telescopeObservationID: data.telescopeObservationID || data.telescope_observation_id || data.id,
    status: data.status || OBSERVATION_STATUS.DRAFT,
    observationDate: data.observationDate,
    observerLatitude: data.observerLatitude,
    observerLongitude: data.observerLongitude,
    createdAt: data.createdAt,
    completionDate: data.completionDate,
    formationDate: data.formationDate,
    creatorID: data.creatorID,
    moderatorID: data.moderatorID,
    stars: stars as ModelsStar[],
    telescopeObservationStars: telescopeObservationStars,
    creator: data.creator,
    moderator: data.moderator,
  };
}

const saveToLocalStorage = (state: TelescopeObservationDraftState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      app_id: state.app_id,
      count: state.count,
    }));
  } catch (e) {
    console.error('Ошибка сохранения корзины в localStorage:', e);
  }
};

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
  async (starId: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.stars.postStars(starId);
      
      // После успешного добавления, обновляем информацию о корзине
      const state = getState() as RootState;
      const app_id = state.telescopeObservationDraft.app_id;

      if (app_id) {
        // Загружаем обновлённую заявку с сервера
        await dispatch(getObservationDraft(app_id));
      } else {
        // Или обновляем корзину
        await dispatch(getCartInfo());
      }
      
      return response.data;
    } catch {
      return rejectWithValue("Ошибка при добавлении звезды в наблюдение");
    }
  }
);

//4. Удаление заявки
export const deleteObservation = createAsyncThunk(
  "telescopeObservationDraft/deleteObservation",
  async (observationId: number, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.telescopeObservationsDelete(
        observationId
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return rejectWithValue("Удаление доступно только модераторам");
      }
      return rejectWithValue("Ошибка при удалении заявки");
    }
  }
);

//5. Сохранение полей заявки
export const updateObservation = createAsyncThunk(
  "telescopeObservationDraft/updateObservation",
  async ({ 
    observationId, 
    observationData 
  }: { 
    observationId: number; 
    observationData: {
      observationDate?: string;
      observerLatitude?: number;
      observerLongitude?: number;
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.telescopeObservationsUpdate(
        observationId,
        observationData
      );
      return response.data;
    } catch {
      return rejectWithValue("Ошибка при обновлении данных заявки");
    }
  }
);

//6. Удаление звезды из заявки
export const deleteStarFromObservation = createAsyncThunk(
  "telescopeObservationDraft/deleteStarFromObservation",
  async ({ 
    observationId, 
    starId 
  }: { 
    observationId: number; 
    starId: number 
  }, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservationStars.telescopeObservationStarsDelete({
        telescope_observation_id: observationId,
        star_id: starId
      });
      return { observationId, starId, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 400) {
        return rejectWithValue("Неверные параметры запроса");
      }
      return rejectWithValue("Ошибка при удалении звезды из заявки");
    }
  }
);

//7. Обновление количества звезды в заявке
export const updateStarInObservation = createAsyncThunk(
  "telescopeObservationDraft/updateStarInObservation",
  async ({ 
    observationId, 
    starId,
    updates
  }: { 
    observationId: number; 
    starId: number;
    updates: {
      quantity?: number;
      order_number?: number;
      result_value?: number;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservationStars.telescopeObservationStarsUpdate({
        telescope_observation_id: observationId,
        star_id: starId,
        ...updates
      });
      return { observationId, starId, data: response.data, updates };
    } catch (error: any) {
      if (error.response?.status === 400) {
        return rejectWithValue("Неверные параметры для обновления");
      }
      return rejectWithValue("Ошибка при обновлении звезды в заявке");
    }
  }
);

//8. Отправка заявки (формирование)
export const submitObservation = createAsyncThunk(
  "telescopeObservationDraft/submitObservation",
  async (observationId: number, { rejectWithValue }) => {
    try {
      const response = await api.telescopeObservations.submitUpdate(observationId);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || "Нельзя сформировать эту заявку";
        return rejectWithValue(errorMsg);
      }
      return rejectWithValue("Ошибка при отправке заявки");
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
      state.isDraft = false;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
    clearError(state) {
      state.error = null;
    },
    // Редьюсер для сохранения полей заявки
    setObservationData(state, action) {
      if (state.observation) {
        state.observation = {
          ...state.observation,
          ...action.payload,
        };
      }
    },
    // Редьюсер для удаления звезды из локального состояния
    removeStarFromObservation(state, action) {
      if (state.observation?.stars) {
        state.observation.stars = state.observation.stars.filter(
          (star) => star.starID !== action.payload
        );
        state.count = state.observation.stars.length;
      }
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

        if (action.payload.stars && Array.isArray(action.payload.stars)) {
          state.count = action.payload.stars.reduce(
            (total: number, star: any) => total + (star.quantity || 1), 
            0
          );
        } else {
          state.count = 0;
        }
        saveToLocalStorage(state);
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

        if (action.payload.stars && Array.isArray(action.payload.stars)) {
          state.count = action.payload.stars.reduce(
            (total: number, star: any) => {
              const quantity = star.quantity || 1;
              return total + quantity;
            }, 
            0
          );
        } else {
          state.count = 0;
        }
        
        state.isDraft = action.payload.status === OBSERVATION_STATUS.DRAFT;
        saveToLocalStorage(state);
      })
      .addCase(getObservationDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // addStarToObservation
      .addCase(addStarToObservation.pending, (state) => {
        state.loading = true;
      })

      .addCase(addStarToObservation.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.total_quantity !== undefined) {
          state.count = Number(action.payload.total_quantity);
        } else if (action.payload?.count !== undefined) {
          state.count = Number(action.payload.count);
        } else {
          state.count += 1;
        }
        
        saveToLocalStorage(state);
      })

      .addCase(addStarToObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Удаление заявки
      .addCase(deleteObservation.fulfilled, (state) => {
        state.app_id = null;
        state.count = 0;
        state.observation = null;
        state.isDraft = false;
        state.loading = false;
      })
      .addCase(deleteObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обновление заявки
      .addCase(updateObservation.fulfilled, (state, action) => {
        state.loading = false;
        if (state.observation) {
          state.observation = {
            ...state.observation,
            ...action.payload,
          };
        }
      })
      .addCase(updateObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Удаление звезды из заявки
      .addCase(deleteStarFromObservation.fulfilled, (state, action) => {
        state.loading = false;

        if (state.observation?.stars) {
          state.observation.stars = state.observation.stars.filter(
            (star) => star.starID !== action.payload.starId
          );
          state.count = state.observation.stars.reduce(
            (total: number, star: any) => {
              const quantity = star.quantity || 1;
              return total + quantity;
            }, 
            0
          );
        }
      })
      .addCase(deleteStarFromObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // submitObservation
      .addCase(submitObservation.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitObservation.fulfilled, (state) => {
        state.loading = false;
        state.isDraft = false;
        if (state.observation) {
          state.observation.status = OBSERVATION_STATUS.SUBMITTED;
        }
      })
      .addCase(submitObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateStarInObservation
      .addCase(updateStarInObservation.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateStarInObservation.fulfilled, (state, action) => {
        state.loading = false;

        if (state.observation?.stars) {
          const starIndex = state.observation.stars.findIndex(
            star => star.starID === action.payload.starId
          );
          
          if (starIndex !== -1 && action.payload.updates.quantity !== undefined) {
            const star = state.observation.stars[starIndex] as ExtendedStar;
            star.quantity = action.payload.updates.quantity;
            
            state.count = state.observation.stars.reduce(
              (total: number, star: any) => total + (star.quantity || 1), 
              0
            );
          }
        }
      })
      .addCase(updateStarInObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDraft, clearError, setObservationData, removeStarFromObservation } = telescopeObservationDraftSlice.actions;
export default telescopeObservationDraftSlice.reducer;
