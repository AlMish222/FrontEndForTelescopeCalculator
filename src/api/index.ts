import { Api } from "./Api";

export const api = new Api({
  baseURL: "http://localhost:9005/api",
  withCredentials: true,
});