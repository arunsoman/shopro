// ─────────────────────────────────────────────────────────────
// auth.types.ts
// ─────────────────────────────────────────────────────────────

export type UserRole = "OWNER" | "MANAGER" | "CHEF" | "SERVER" | "READONLY";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: number;
  active: boolean;
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: AuthToken;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  token: string;
  newPassword: string;
}
