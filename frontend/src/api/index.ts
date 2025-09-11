import type { Method, AxiosInstance, AxiosRequestConfig } from 'axios';

import axios from 'axios';

class ApiService {
  // setAuthToken(token: (arg0: string, token: any) => unknown) {
  //   this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // }

  setAuthToken(token: string) {
    this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  clearAuthToken() {
    delete this.http.defaults.headers.common['Authorization'];
  }


  private static instance: ApiService;
  private http: AxiosInstance;
  
  private constructor() {
    
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const env = import.meta.env.VITE_ENVIRONMENT;
    this.http = axios.create({
      baseURL: env === 'development'? baseURL : 'http://137.59.54.114:8101', // Replace with your API base URL or use the environment variable
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Origin': import.meta.env.VITE_API_FRONTEND_URL,
      },
    });

    this.http.interceptors.response.use(
      response => response,
      error => {
        console.error('HTTP Error:', error);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.get<T>(url, config);
    return res.data;
  }

  async post<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<T> {
    console.log('------------POST URL:--------------------', url);
    const res = await this.http.post<T>(url, data, config);
    return res.data;
  }

  async put<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.put<T>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.delete<T>(url, config);
    return res.data;
  }

  async patch<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.http.patch<T>(url, data, config);
    return res.data;
  }

  async fetchExternal<T>(fullUrl: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await axios.get<T>(fullUrl, config);
    return res.data;
  }

  async requestWithBaseUrl<T>(
    method: Method,
    baseURL: string,
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await instance.request<T>({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return res.data;
  }
}

const apiService = ApiService.getInstance();

export {
  apiService
}