import type { ApiResponse } from "./response.model";

export interface LoginPayload {
  user_email: string;
  password: string;
}

export interface LoginUserData {
  full_name: string;
  user_name: string;
  userId: string;
  username: string;
  email: string;
  token: string;
  roles?: string[];
}

export type LoginResponse = ApiResponse<LoginUserData>;
