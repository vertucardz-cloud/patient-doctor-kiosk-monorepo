import { apiService } from '../api';

// interface AuthResponse {
//   user(user: any): unknown;
//   token(arg0: string, token: any): unknown;
//   id: number;
//   name: string;
//   email: string;
// }

export interface AuthResponse {
  user(user: any): unknown;
  id: number;
  name: string;
  email: string;
  role?: string;
  token: {
    tokenType: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

const authService = {
  login: (data: LoginDto) => apiService.post<AuthResponse, LoginDto>('/api/v1/auth/login', data),
  register: (data: RegisterDto) => apiService.post<AuthResponse, RegisterDto>('/api/v1/auth/register', data),
 
  ensureAdmin: async <T>(action: () => Promise<T>): Promise<T> => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('You must be logged in to perform this action.');
    }

    let user: AuthResponse;
    try {
      user = JSON.parse(storedUser) as AuthResponse;
    } catch {
      throw new Error('Stored user data is corrupted.');
    }

    if (!user?.role || user.role.toLowerCase() !== 'admin') {
      throw new Error('You do not have permission to perform this action.');
    }

    return action();
  },

  getAccessToken: (): string | null => localStorage.getItem('access_token'),

  // getAccessToken: () => localStorage.getItem('accessToken'),
};

export default authService;