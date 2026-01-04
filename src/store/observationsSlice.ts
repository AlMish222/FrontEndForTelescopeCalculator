// store/observationsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { 
  ModelsTelescopeObservation,
  ModelsTelescopeObservationStar,
  ModelsStar
} from "../api/Api";

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

interface ExtendedObservation extends ModelsTelescopeObservation {
  completed_stars_count?: number;
  total_stars?: number;
}

interface ObservationsState {
  observations: ExtendedObservation[];
  loading: boolean;
  error: string | null;
}

const initialState: ObservationsState = {
  observations: [],
  loading: false,
  error: null,
};

// Функция маппинга данных из API (как в других slice)
// Функция маппинга данных из API
function mapStarFromApi(star: any, telescopeObservationStar?: any): ModelsStar & { quantity?: number; resultValue?: number } {
  // Сначала проверяем все варианты написания полей
  const starID = star?.starId || star?.StarID || star?.starID;
  const starName = star?.starName || star?.StarName;
  const shortDescription = star?.shortDescription || star?.ShortDescription;
  const description = star?.description || star?.Description;
  const imageURL = star?.imageUrl || star?.imageURL || star?.ImageURL;
  const isActive = star?.isActive || star?.IsActive || true;
  const ra = star?.ra || star?.RA;
  const dec = star?.dec || star?.Dec;
  const observations = star?.observations || star?.Observations || [];

  return {
    starID,
    starName,
    shortDescription,
    description,
    imageURL,
    isActive,
    ra,
    dec,
    observations,

    quantity: telescopeObservationStar?.quantity || star?.quantity,
    resultValue: telescopeObservationStar?.resultValue || star?.resultValue,
  };
}

function mapTelescopeObservationStarFromApi(data: any): ModelsTelescopeObservationStar {
  return {
    telescopeObservationID: data?.telescopeObservationID || data?.TelescopeObservationID || data?.telescope_observation_id,
    starID: data?.starId || data?.StarID || data?.starID,
    orderNumber: data?.orderNumber || data?.order_number,
    quantity: data?.quantity,
    resultValue: data?.resultValue || data?.result_value,
    star: data?.star ? mapStarFromApi(data.star, data) : undefined,
    telescopeObservation: data?.telescopeObservation || data?.TelescopeObservation,
  };
}

function mapObservationFromApi(data: any): ExtendedObservation {
  console.log("Маппинг наблюдения:", {
    id: data?.TelescopeObservationID,
    hasTelescopeObservationStars: !!data?.TelescopeObservationStars,
    starsCount: data?.TelescopeObservationStars?.length,
    completedStarsCount: data?.completed_stars_count,
    totalStars: data?.total_stars
  });

  // Используем данные с заглавными буквами (как приходят с бэкенда)
  const telescopeObservationID = data?.TelescopeObservationID || data?.telescopeObservationID || data?.id;
  const status = data?.Status || data?.status || OBSERVATION_STATUS.DRAFT;
  const observationDate = data?.ObservationDate || data?.observationDate;
  const observerLatitude = data?.ObserverLatitude || data?.observerLatitude;
  const observerLongitude = data?.ObserverLongitude || data?.observerLongitude;
  const createdAt = data?.CreatedAt || data?.createdAt;
  const completionDate = data?.CompletionDate || data?.completionDate;
  const formationDate = data?.FormationDate || data?.formationDate;
  const creatorID = data?.CreatorID || data?.creatorID;
  const moderatorID = data?.ModeratorID || data?.moderatorID;
  
  // Обрабатываем массивы - они тоже приходят с заглавных букв
  const stars = (data?.Stars || data?.stars || []).map((star: any) => mapStarFromApi(star, star));
  const telescopeObservationStars = (data?.TelescopeObservationStars || data?.telescopeObservationStars || [])
    .map(mapTelescopeObservationStarFromApi);
  
  const creator = data?.Creator || data?.creator;
  const moderator = data?.Moderator || data?.moderator;
  const completed_stars_count = data?.completed_stars_count || data?.CompletedStarsCount || 0;

  const total_stars = data?.total_stars || data?.TotalStars || 
                     telescopeObservationStars.length || 
                     stars.length || 
                     0;

  // Если есть связанные данные в telescopeObservationStars, обновляем звезды
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

  let finalStars = stars as ModelsStar[];
  if (stars.length === 0 && telescopeObservationStars.length > 0) {
    finalStars = telescopeObservationStars
      .filter((tos: any) => tos.star) // Фильтруем те, у которых есть star
      .map((tos: any) => {
        const starData = tos.star || {};
        return {
          starID: starData.starID || tos.starID,
          starName: starData.starName || '',
          shortDescription: starData.shortDescription || '',
          description: starData.description || '',
          imageURL: starData.imageURL || '',
          isActive: starData.isActive !== undefined ? starData.isActive : true,
          ra: starData.ra || 0,
          dec: starData.dec || 0,
          observations: starData.observations || [],
          
          // Данные из TelescopeObservationStar
          quantity: tos.quantity || 1,
          resultValue: tos.resultValue,
          orderNumber: tos.orderNumber
        };
      });
  }

  return {
    telescopeObservationID,
    status,
    observationDate,
    observerLatitude,
    observerLongitude,
    createdAt,
    completionDate,
    formationDate,
    creatorID,
    moderatorID,
    stars: stars as ModelsStar[],
    telescopeObservationStars,
    creator,
    moderator,
    completed_stars_count,
    total_stars,
  };
}

// Загрузка заявок с поддержкой query параметров
export const fetchUserObservations = createAsyncThunk(
  "observations/fetchAll",
  async (queryString: string = "", { rejectWithValue }) => {
    try {
      // Парсим query параметры
      const searchParams = new URLSearchParams(queryString);
      const query: any = {};
      
      if (searchParams.has('from')) query.from = searchParams.get('from');
      if (searchParams.has('to')) query.to = searchParams.get('to');
      if (searchParams.has('status')) query.status = searchParams.get('status');
      
      console.log("Загрузка заявок с параметрами:", query);
      
      // Используем сгенерированный метод с query параметрами
      const response = await api.telescopeObservations.telescopeObservationsList(
        query,  // query параметры передаются первым аргументом
        {}      // дополнительные параметры
      );
      
      // Маппим данные
      const mappedObservations = response.data.map((obs: any) => mapObservationFromApi(obs));
      return mappedObservations;
      
    } catch (error: any) {
      console.error("Ошибка загрузки заявок:", error);
      return rejectWithValue(error.message || "Ошибка загрузки заявок");
    }
  }
);

// Действия модератора
export const moderateObservation = createAsyncThunk(
  "observations/moderate",
  async ({ 
    observationId, 
    action 
  }: { 
    observationId: number; 
    action: 'complete' | 'reject' 
  }, { rejectWithValue }) => {
    try {
      // Правильный вызов сгенерированного метода
      const response = await api.telescopeObservations.completeUpdate(
        observationId,
        { action }  // input: Record<string, string>
      );
      
      return { 
        observationId, 
        action, 
        data: response.data
      };
    } catch (error: any) {
      console.error("Ошибка модерации заявки:", error);
      
      // Детальная обработка ошибок
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.statusText;
        
        if (status === 401) return rejectWithValue("Ошибка авторизации");
        if (status === 403) return rejectWithValue("Только модератор может выполнять это действие");
        if (status === 404) return rejectWithValue("Заявка не найдена");
        if (status === 400) return rejectWithValue(message || "Неверный запрос");
        
        return rejectWithValue(`Ошибка сервера: ${status}`);
      }
      
      return rejectWithValue(error.message || "Ошибка выполнения действия");
    }
  }
);

const observationsSlice = createSlice({
  name: "observations",
  initialState,
  reducers: {
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
    
    // Ручное обновление заявки
    updateObservation: (state, action) => {
      const updatedObs = mapObservationFromApi(action.payload);
      const index = state.observations.findIndex(
        obs => obs.telescopeObservationID === updatedObs.telescopeObservationID
      );
      
      if (index !== -1) {
        state.observations[index] = updatedObs;
      }
    },
    
    // Обновление поля completed_stars_count для конкретной заявки
    updateCompletedStarsCount: (state, action) => {
      const { observationId, count } = action.payload;
      const index = state.observations.findIndex(
        obs => obs.telescopeObservationID === observationId
      );
      
      if (index !== -1) {
        state.observations[index].completed_stars_count = count;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Загрузка заявок
      .addCase(fetchUserObservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserObservations.fulfilled, (state, action) => {
        state.loading = false;
        state.observations = action.payload;
      })
      .addCase(fetchUserObservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Действия модератора
      .addCase(moderateObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moderateObservation.fulfilled, (state, action) => {
        state.loading = false;
        
        const { observationId, action: moderationAction } = action.payload;

        const index = state.observations.findIndex(
            obs => obs.telescopeObservationID === observationId
        );
        
        if (index !== -1) {
            if (moderationAction === 'reject') {
              state.observations[index].status = 'отклонён';
            }
          }
      })
      .addCase(moderateObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateObservation, updateCompletedStarsCount } = observationsSlice.actions;
export default observationsSlice.reducer;