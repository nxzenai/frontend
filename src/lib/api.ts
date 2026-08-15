import axios from "axios";

export const api = axios.create({
   //baseURL: "http://127.0.0.1:8001",
  //baseURL: "https://www.nxzenai.com",
  baseURL: "https://coral-app-8t2db.ondigitalocean.app",

});

//import axios from "axios";

//const studioApiUrl = process.env.NEXT_PUBLIC_STUDIO_API_URL;

//if (!studioApiUrl) {
//  throw new Error("NEXT_PUBLIC_STUDIO_API_URL is not configured.");
//}

//const studioApi = axios.create({
  //baseURL: studioApiUrl,
 // headers: {
    //"Content-Type": "application/json",
  //},
//});

//studioApi.interceptors.request.use((config) => {
  //if (typeof window !== "undefined") {
    //const token = localStorage.getItem("token");

    //if (token) {
      //config.headers.Authorization = `Bearer ${token}`;
    //}
  //}

 // return config;
//});

//export default studioApi;
