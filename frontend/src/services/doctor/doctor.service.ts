import { apiService } from '../../api';
import authService from '../auth.service';


export interface Doctor {
  id: string;
  name: string;
   username: string;
  password: string;
  phone: string;
  specialty: string;
  email: string;
  isActive: true,
}

export interface DoctorDto {
  password: string;
  username: string;

  name: string;
  phone: string;
  specialty: string;
  email: string;

}

export interface CreateDoctorDto {
  name: string;
   username: string;
  password: string;
  phone: string;
  specialty: string;
  email: string;

}

export interface UpdateDoctorDto {
  name: string;
  phone: string;
  specialty: string;
  email: string;
}

export interface DeleteDoctorDto {
  id: string;
}


export const DoctorService = {
  getDoctors: () =>
    authService.ensureAdmin(() =>
      apiService.get<Doctor[]>('/api/v1/Doctors')
    ),

  getDoctorById: (id: string) =>
    authService.ensureAdmin(() =>
      apiService.get<Doctor>(`/api/v1/Doctors/${id}`)
    ),

  createDoctor: (data: CreateDoctorDto) =>
    authService.ensureAdmin(() =>
      apiService.post<Doctor, CreateDoctorDto>('/api/v1/Doctors', data)
    ),

  updateDoctor: (id: string, data: UpdateDoctorDto) =>
    authService.ensureAdmin(() =>
      apiService.put<Doctor, UpdateDoctorDto>(`/api/v1/Doctors/${id}`, data)
    ),

  deleteDoctor: (id: string) =>
    authService.ensureAdmin(() =>
      apiService.delete<DeleteDoctorDto>(`/api/v1/Doctors/${id}`)
    ),
};


export default DoctorService;