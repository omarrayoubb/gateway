// libs/common/src/types/auth.ts

// Register Types
export interface RegisterRequest {
  workId: string;
  name: string;
  email: string;
  workLocation: string;
  role: string;
  password: string;
  timezone: string;
  department: string;
  deptManager: string;
  birthday: string;
}

export interface RegisterResponse {
  status: number;
  error: string[];
  email: string;
}

// Login Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  error: string[];
  accessToken: string;
  userData: UserData | null;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Validate Types
export interface ValidateRequest {
  token: string;
}

export interface ValidateResponse {
  valid: boolean;
  user: UserData | null;
}

// GetProfile Types
export interface GetProfileRequest {
  userId: string;
}

export interface GetProfileResponse {
  status: number;
  error: string[];
  profile: UserProfile | null;
}

export interface UserProfile {
  id: string;
  workId: string;
  name: string;
  email: string;
  workLocation: string;
  role: string;
  timezone: string;
  department: string;
  deptManager: string;
  birthday: string;
  dateJoined: string;
}

// UpdateProfile Types
export interface UpdateProfileRequest {
  userId: string;
  name?: string;
  email?: string;
  workLocation?: string;
  role?: string;
  timezone?: string;
  department?: string;
  deptManager?: string;
  birthday?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  status: number;
  error: string[];
  profile: UserProfile | null;
}

// GetUsers Types
export interface GetUsersRequest { }

export interface GetUsersResponse {
  users: UserData[];
}