import axios from "axios";

export const api = axios.create({
  // baseURL: "http://127.0.0.1:8001",
  baseURL: "https://coral-app-8t2db.ondigitalocean.app",
});