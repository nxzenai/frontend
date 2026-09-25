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
    // Bind the greeting to this login, so refreshes preserve it and old tokens
    // or a different account cannot inherit it.
    if (response.data.data.is_first_login === true) {
      localStorage.setItem("first_login_token", response.data.data.access_token);
    } else {
      localStorage.removeItem("first_login_token");
    }

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

    return {
      ...response.data.data,
      is_first_login: !!this.getToken() &&
        localStorage.getItem("first_login_token") === this.getToken(),
    };
  }

  logout() {
    void api.post("/auth/logout").finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("first_login_token");
      window.location.href = "/login";
    });
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}

export default new AuthService();
