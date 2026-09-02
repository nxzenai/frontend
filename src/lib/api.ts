import axios from "axios";

export const api = axios.create({
  //baseURL: "http://127.0.0.1:8001",
  //baseURL: "https://www.nxzenai.com",
  baseURL: "https://coral-app-8t2db.ondigitalocean.app",

});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);