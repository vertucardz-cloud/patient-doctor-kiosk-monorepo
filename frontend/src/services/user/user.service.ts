import { apiService } from '../../api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: "doctor" | "admin" | "patient" | "staff" | 'support'| 'user';
  status: string
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface UserResponse {
  data: {
    id: string;
    username: string;
    email: string;
    role: "doctor" | "admin" | "patient" | "staff" | 'support';
    status: string
    avatarUrl?: string;
    isVerified?: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }[],
  meta: {
    total: number,
    pagination: {
      current: number,
      prev: string |null,
      next: string| null
    }
  }
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  status?: string;
  role?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const userService = {
  getUsers: () => apiService.get<UserResponse>('api/v1/users'),
  getUserById: (id: string) => apiService.get<User>(`api/v1/users/${id}`),
  createUser: (user: CreateUserDto) => apiService.post<User, CreateUserDto>('api/v1/users', user),
  getProfile: () => apiService.get<User>('api/v1/users/profile'),
  updateUser: (id: string, user: UpdateUserDto) => apiService.put<User, UpdateUserDto>(`api/v1/users/${id}`, user),
  partialUpdateUser: (id: string, user: UpdateUserDto) => apiService.patch<User, UpdateUserDto>(`api/v1/users/${id}`, user),
  deleteUser: (id: string) => apiService.delete<{ message: string }>(`api/v1/users/${id}`),
};

export default userService;