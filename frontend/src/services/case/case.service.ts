import { apiService } from '../../api';

// ---------------------------------------------
// Interfaces
// ---------------------------------------------

export interface Case {
  id: string;
  qrCodeId: string;
  description: string;
  patientId: string;
  doctorId: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  medicationCost?: number;
  followUpDate?: string | Date;
  mediaFiles?: string[]; // store file URLs or IDs
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateCaseDto {
  qrCodeId: string;
  description: string;
  patientId: string;
  doctorId: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  medicationCost?: number;
  followUpDate?: string | Date;
  mediaFiles?: string[];
}

export interface UpdateCaseDto {
  description?: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  medicationCost?: number;
  followUpDate?: string | Date;
  mediaFiles?: string[];
}

export interface ICaseFilter {
  id?: string;
  patientId?: string;
  doctorId?: string;
  qrCodeId?: string;
  followUpDateStart?: string | Date;
  followUpDateEnd?: string | Date;
}

export interface ISortBy {
  name: string;
  order: 'asc' | 'desc';
}

export interface IListOptions {
  page?: number;
  limit?: number;
  sort?: ISortBy;
  filter?: ICaseFilter;
}

export interface ICaseResponse {
  result: Case[];
  page: number;
  total: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------
// Service
// ---------------------------------------------

export const CaseService = {
  list: (data: IListOptions) =>
    apiService.post<Case[], IListOptions>('/api/v1/cases/list', data),

  getById: (caseId: string) =>
    apiService.get<Case>(`/api/v1/cases/${caseId}`),

  create: (data: CreateCaseDto) =>
    apiService.post<Case, CreateCaseDto>('/api/v1/cases/create', data),

  update: (caseId: string, data: UpdateCaseDto) =>
    apiService.patch<Case, UpdateCaseDto>(`/api/v1/cases/${caseId}`, data),
};

export default CaseService;
