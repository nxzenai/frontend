import api from "@/lib/studioApi";
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  MeResponse,
} from "@/types/auth";

class AuthService {
  async login(payload: LoginRequest) {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      payload
    );

    localStorage.setItem(
      "token",
      response.data.data.access_token
    );

    return response.data;
  }

  async register(payload: RegisterRequest) {
    const response = await api.post(
      "/auth/register",
      payload
    );

    return response.data;
  }

  async me() {
    const response =
      await api.get<MeResponse>("/auth/me");

    return response.data.data;
  }

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}

export default new AuthService();
