import { apiService } from '../../api';
import authService from '../auth.service';

export interface FranchiseQRCode {
  id: string;
  franchiseId: string;
  qrImageUrl: string;
  
}

export interface Franchise {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  postalCode: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  qrCodes?: FranchiseQRCode[];
}

export interface FranchiseDto {

  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  postalCode: string;

}

export interface CreateFranchiseDto {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  postalCode: string;

}

export interface UpdateFranchiseDto {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  postalCode: string;
}



export const FranchiseService = {
  getFranchises: () =>
    authService.ensureAdmin(() =>
      apiService.get<Franchise[]>('/api/v1/franchises')
    ),

  getFranchiseById: (id: string) =>
    authService.ensureAdmin(() =>
      apiService.get<Franchise>(`/api/v1/franchises/${id}`)
    ),

  createFranchise: (data: CreateFranchiseDto) =>
    authService.ensureAdmin(() =>
      apiService.post<Franchise, CreateFranchiseDto>('/api/v1/franchises', data)
    ),

  updateFranchise: (id: string, data: UpdateFranchiseDto) =>
    authService.ensureAdmin(() =>
      apiService.put<Franchise, UpdateFranchiseDto>(`/api/v1/franchises/${id}`, data)
    ),

  deleteFranchise: (id: string) =>
    authService.ensureAdmin(() =>
      apiService.delete(`/api/v1/franchises/${id}`)
    ),
};


export default FranchiseService;