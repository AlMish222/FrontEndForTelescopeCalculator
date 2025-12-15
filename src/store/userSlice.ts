import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

interface UserState {
  username: string;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const savedToken = localStorage.getItem("authToken");
const savedUsername = localStorage.getItem("username");

const initialState: UserState = {
  username: savedUsername || "",
  token: savedToken,
  isAuthenticated: !!savedToken,
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

      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("username", credentials.username);
      }

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
  },
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

        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.username = "";
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUserAsync.rejected, (state) => {
        state.username = "";
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
  },
});

export default userSlice.reducer;
