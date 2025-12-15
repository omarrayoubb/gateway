// libs/common/src/types/auth.ts

// 1. The Request DTO (Matches 'RegisterRequest' in proto)
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
  
  // 2. The Response DTO (Matches 'RegisterResponse' in proto)
  export interface RegisterResponse {
    status: number;
    error: string[];
    email: string;
  }
  
  // 3. The Login Request
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // 4. The Login Response (Matches 'LoginResponse' in proto)
  export interface LoginResponse {
    status: number;
    error: string[];
    accessToken: string;
    userData: {
      sub: string;
      email: string;
      roleId: string;
      roleName: string;
      profileId: string;
      profileName: string;
    };
  }