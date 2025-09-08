import { Doctor } from "@prisma/client";



/**
 * DTO for creating a doctor
 */
export interface DoctorCreateDto {
  username: string;
  email: string;
  password: string;
  apikey?: string;
  name: string;
  specialty: string;
  phone: string;
}

/**
 * DTO for updating a doctor
 */
export interface DoctorUpdateDto {
    name?: string;
    specialty?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
    username?: string,
    isUpdatePassword?: boolean;
    password?: string;
    passwordConfirmation?: string;
    passwordToRevoke?: string;
}

/**
 * DTO for safe response (excludes relations unless explicitly included)
 */
export interface DoctorResponseDto {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapper function from Doctor -> DoctorResponseDto
 */
export const toDoctorResponseDto = (doctor: Doctor): DoctorResponseDto => ({
  id: doctor.id,
  name: doctor.name,
  specialty: doctor.specialty,
  phone: doctor.phone,
  email: doctor.email,
  isActive: doctor.isActive,
  createdAt: doctor.createdAt,
  updatedAt: doctor.updatedAt,
});
