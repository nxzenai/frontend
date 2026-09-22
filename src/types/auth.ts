export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  account_status: "pending_approval" | "active" | "rejected" | "suspended" | "expired" | "deleted";
  organization_id?: string | null;
  course_id?: string | null;
  batch_id?: string | null;
  access_start_at?: string | null;
  access_end_at?: string | null;
  effective_modules: string[];
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}
