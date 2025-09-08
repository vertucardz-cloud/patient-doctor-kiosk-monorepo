import { STATUS, ROLE, User } from "@prisma/client";

/**
 * DTO for creating a new user
 */
export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  role?: ROLE;
}

/**
 * DTO for updating an existing user
 */
export interface UserUpdateDto {
  username?: string;
  email?: string;
  password?: string;
  role?: ROLE;
  status?: STATUS;
  deletedAt?: Date | null;
}

/**
 * DTO for returning user data (safe for clients)
 */
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: ROLE;
  status: STATUS;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapper: User -> UserResponseDto
 * Hides sensitive fields like password, apikey, refreshToken
 */
export const toUserResponseDto = (user: User): UserResponseDto  =>{
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
