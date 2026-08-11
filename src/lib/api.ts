//import axios from "axios";

//export const api = axios.create({
  // baseURL: "http://127.0.0.1:8001",
  //baseURL: "https://www.nxzenai.com",
//});
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STUDIO_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});