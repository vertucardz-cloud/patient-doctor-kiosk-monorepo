
import { apiService } from '../../api';

export interface IOverviewResponse {
  widgets: {
    totalRequests: {
      percent: number;
      total: number;
      series: number[];
    };
    activeLocations: {
      percent: number;
      total: number;
      series: number[];
    };
    pendingCases: {
      percent: number;
      total: number;
      series: number[];
    };
    avgResponse: {
      percent: number;
      total: number;
      series: number[];
    };
  };
  currentVisits: {
    series: {
      label: string;
      value: number;
    }[];
  };
  websiteVisits: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
  conversionRates: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}


export const overviewService = {
  getOverview: () => apiService.get<IOverviewResponse>('/api/v1/overview'),
}

export default overviewService
