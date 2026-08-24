import axios from "axios";
import { validateStudioApiUrl } from "./studioApiConfig";

const studioApiUrl = validateStudioApiUrl(
  process.env.NEXT_PUBLIC_STUDIO_API_URL,
  process.env.NODE_ENV === "production",
);

const studioApi = axios.create({
  baseURL: studioApiUrl,

});

studioApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default studioApi;
