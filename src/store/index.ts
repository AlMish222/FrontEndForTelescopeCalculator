import { configureStore } from "@reduxjs/toolkit";
import starsReducer from "./starsSlice.ts";

export const store = configureStore({
  reducer: {
    stars: starsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;