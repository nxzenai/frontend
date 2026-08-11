import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_MARKETING_API_URL ??
    "https://coral-app-8t2db.ondigitalocean.app",
});
