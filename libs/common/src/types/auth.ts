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
  departmentId?: string | null; // preferred: FK to departments.id
  department?: string; // optional backward compat (department name)
  deptManager?: string;
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
  departmentId: string | null;
  department: string; // department name from join
  birthday: string;
  dateJoined: string;
  status?: string;
  position?: string;
  hireDate?: string;
  managerId?: string | null;
  hierarchyLevel?: number | null;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  baseSalary?: string | null;
}

// UpdateProfile Types
export interface UpdateProfileRequest {
  userId: string;
  workId?: string;
  name?: string;
  email?: string;
  workLocation?: string;
  role?: string;
  timezone?: string;
  departmentId?: string | null;
  birthday?: string;
  password?: string;
  status?: string;
  position?: string;
  hireDate?: string;
  managerId?: string | null;
  hierarchyLevel?: number | null;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  baseSalary?: string | null;
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

// DeleteUser Types
export interface DeleteUserRequest {
  userId: string;
}

export interface DeleteUserResponse {
  success: boolean;
  error?: string;
}
