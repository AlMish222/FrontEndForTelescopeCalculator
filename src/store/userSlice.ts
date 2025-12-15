import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

interface UserState {
  username: string;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: UserState = {
  username: "",
  token: null,
  isAuthenticated: false,
  error: null,
};

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

      // 👇 ВАЖНО: token из бека
      return {
        username: credentials.username,
        token: res.data.token,
      };
    } catch {
      return rejectWithValue("Ошибка авторизации");
    }
  }
);

// ===== logout =====
export const logoutUserAsync = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.users.logoutCreate();
      return true;
    } catch {
      return rejectWithValue("Ошибка выхода");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload as string;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.username = "";
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export default userSlice.reducer;
