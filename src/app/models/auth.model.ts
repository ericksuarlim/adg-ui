export interface JwtPayload {
  sub: string;
  username: string;
  uuid_company: string;
  roles: string[];
  session_id?: string;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  token: string;
  username: string;
  uuid_company: string;
  roles: string[];
}

export interface LoginRequest {
  user_name: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      username: string;
      uuid_company: string;
    };
    session: unknown;
  };
  error?: string;
}
