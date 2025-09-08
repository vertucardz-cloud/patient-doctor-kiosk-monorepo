import { apiService } from '../../api';

// ---------------------------------------------
// Interfaces
// ---------------------------------------------

export interface TreatmentPlan {
  id: string;
  caseId: string;
  doctorId: string;
  summary: string;
  medication?: string;
  estimatedCost: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTreatmentPlanDto {
  caseId: string;
  doctorId: string;
  summary: string;
  medication?: string;
  estimatedCost: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateTreatmentPlanDto {
  summary?: string;
  medication?: string;
  estimatedCost?: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface ITreatmentPlanFilter {
  id?: string;
  caseId?: string;
  doctorId?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAtStart?: string | Date;
  createdAtEnd?: string | Date;
}

export interface ISortBy {
  name: string;
  order: 'asc' | 'desc';
}

export interface IListOptions {
  page?: number;
  limit?: number;
  sort?: ISortBy;
  filter?: ITreatmentPlanFilter;
}

export interface ITreatmentPlanResponse {
  result: TreatmentPlan[];
  page: number;
  total: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------
// Service
// ---------------------------------------------

export const TreatmentPlanService = {
  list: (data: IListOptions) =>
    apiService.post<TreatmentPlan[], IListOptions>('/api/v1/treatment-plans/list', data),

  getById: (treatmentPlanId: string) =>
    apiService.get<TreatmentPlan>(`/api/v1/treatment-plans/${treatmentPlanId}`),

  create: (data: CreateTreatmentPlanDto) =>
    apiService.post<TreatmentPlan, CreateTreatmentPlanDto>('/api/v1/treatment-plans/create', data),

  update: (treatmentPlanId: string, data: UpdateTreatmentPlanDto) =>
    apiService.patch<TreatmentPlan, UpdateTreatmentPlanDto>(`/api/v1/treatment-plans/${treatmentPlanId}`, data),
};

export default TreatmentPlanService;
