import axios from "axios";

const studioApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_STUDIO_API_URL ??
    "http://127.0.0.1:8001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
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
