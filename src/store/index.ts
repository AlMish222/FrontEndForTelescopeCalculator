import { configureStore } from "@reduxjs/toolkit";
import starsReducer from "./starsSlice.ts";
import userReducer from "./userSlice.ts";
import telescopeObservationDraftReducer from "./telescopeObservationDraftSlice.ts"
import observationsReducer from "./observationsSlice.ts";

export const store = configureStore({
  reducer: {
    stars: starsReducer,
    user: userReducer,
    telescopeObservationDraft: telescopeObservationDraftReducer,
    observations: observationsReducer,
  },
});

export const initializeAuth = () => {
  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");
  
  return {
    user: {
      username: username || "",
      token: token,
      isAuthenticated: !!token,
      error: null,
    }
  };
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;