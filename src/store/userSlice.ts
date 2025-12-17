import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

interface UserState {
  username: string;
  token: string | null;
  isAuthenticated: boolean;
  is_moderator: boolean;
  user_id: number | null;
  error: string | null;
}

const savedToken = localStorage.getItem("authToken");
const savedUsername = localStorage.getItem("username");

const initialState: UserState = {
  username: savedUsername || "",
  token: savedToken,
  isAuthenticated: !!savedToken,
  is_moderator: false,
  user_id: null,
  error: null,
};

// ===== Автоматическая проверка при старте =====
export const checkAuthAsync = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    if (!savedToken) return rejectWithValue("Нет токена");
    
    try {
      const res = await api.users.getUsers();
      const data = res.data;
      
      // Обрабатываем оба варианта
      const is_moderator = data.IsModerator !== undefined ? data.IsModerator : 
                          data.is_moderator !== undefined ? data.is_moderator : false;
      
      const user_id = data.UserID !== undefined ? data.UserID : 
                     data.user_id !== undefined ? data.user_id : null;
      
      const username = data.Username !== undefined ? data.Username : 
                      data.username !== undefined ? data.username : '';
      
      return {
        user_id,
        username,
        is_moderator,
      };
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      return rejectWithValue("Токен невалиден");
    }
  }
);


// ===== login =====
export const loginUserAsync = createAsyncThunk(
  "user/login",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.users.loginCreate({
        Username: credentials.username,
        Password: credentials.password,
      });

      if (!res.data.token) {
        return rejectWithValue("Токен не получен");
      }

      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("username", credentials.username);

      // Возвращаем только токен и имя
      return {
        username: credentials.username,
        token: res.data.token,
        user_id: null, // Будет загружено отдельно
        is_moderator: false, // Будет загружено отдельно
      };
    } catch {
      return rejectWithValue("Ошибка авторизации");
    }
  }
);

// ===== Отдельный thunk для загрузки данных пользователя =====
export const fetchUserDataAsync = createAsyncThunk(
  "user/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.users.getUsers();
      console.log("Ответ от /users/me:", res.data);
      
      // Обрабатываем оба варианта: строчные и заглавные
      const data = res.data;
      const is_moderator = data.IsModerator !== undefined ? data.IsModerator : 
                          data.is_moderator !== undefined ? data.is_moderator : false;
      
      const user_id = data.UserID !== undefined ? data.UserID : 
                     data.user_id !== undefined ? data.user_id : null;
      
      const username = data.Username !== undefined ? data.Username : 
                      data.username !== undefined ? data.username : '';
      
      console.log("Обработанные данные:", { is_moderator, user_id, username });
      
      return {
        user_id,
        username,
        is_moderator,
      };
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
      return rejectWithValue("Не удалось загрузить данные пользователя");
    }
  }
);

// ===== logout =====
export const logoutUserAsync = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.users.logoutCreate();
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      return true;
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      return rejectWithValue("Ошибка выхода");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Ручное обновление is_moderator (если нужно)
    setModeratorStatus(state, action) {
      state.is_moderator = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.user_id = action.payload.user_id || null;
        state.username = action.payload.username;
        state.is_moderator = action.payload.is_moderator;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthAsync.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user_id = null;
        state.is_moderator = false;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.user_id = action.payload.user_id || null;
        state.is_moderator = action.payload.is_moderator;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user_id = null;
        state.is_moderator = false;
        state.error = action.payload as string;
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
      })
      .addCase(fetchUserDataAsync.fulfilled, (state, action) => {
        state.user_id = action.payload.user_id || null;
        state.username = action.payload.username;
        state.is_moderator = action.payload.is_moderator;
      })
      .addCase(fetchUserDataAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.username = "";
        state.token = null;
        state.isAuthenticated = false;
        state.user_id = null;
        state.is_moderator = false;
        state.error = null;
      })
      .addCase(logoutUserAsync.rejected, (state) => {
        state.username = "";
        state.token = null;
        state.isAuthenticated = false;
        state.user_id = null;
        state.is_moderator = false;
        state.error = null;
      });
  },
});


export const { clearError } = userSlice.actions;
export default userSlice.reducer;