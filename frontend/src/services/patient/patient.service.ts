import { apiService } from '../../api';

export interface Patient {
    id: string,
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    gender: string;
    phone: string;
    status: string;
    age: number;
    franchiseId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
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

export interface CreatePatientsDto {
    phone: string,
    firstname: string,
    lastname: string,
    email: string,
    age: number,
    franchiseId: string
}

export interface UpdatePatientsDto {
    firstname: string,
    lastname: string,
    age: number | string,
    gender: string,
    description: string,
    email?: string,
    caseId: string
}

export interface IPatientFilter {
    id?: string;
    firstname?: string;
    lastname?: string;
    fullname?: string;
    email?: string;
    phone?: string;
    gender?: string;
    status?: string;
    ageMin?: number;
    ageMax?: number;
    franchiseId?: string;
    isActive?: boolean;
    includeFranchise?: boolean;
    createdAtStart?: string | Date;
    createdAtEnd?: string | Date;
}

export interface ISortBy {
    name: string;
    order: 'asc' | 'desc'
};
export interface IListOptions {
    page?: number;
    limit?: number;
    sort?: ISortBy;
    filter?: IPatientFilter;
}


export interface IPatientResponse {
    result: Patient[],
    page: number,
    total: number,
    limit: number,
    totalPages: number
}



export const PatientService = {
    getPatients: (data: IListOptions) => apiService.post<Patient[], IListOptions>('/api/v1/patients/list', data),
    getPatientById: (patientId: string) => apiService.get<Patient>(`/api/v1/patients/${patientId}`),
    createPatient: (data: CreatePatientsDto) => apiService.post<Patient, CreatePatientsDto>('/api/v1/patients/create', data),
    updatePatient: (patientId: string, data: UpdatePatientsDto) => apiService.patch<Patient, UpdatePatientsDto>(`/api/v1/patients/${patientId}`, data)

};


export default PatientService;