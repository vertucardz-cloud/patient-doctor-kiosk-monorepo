import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

class ApiService {
  private instances: Record<string, AxiosInstance> = {};

  public createInstance(platformName: string, config: ApiConfig): void {
    this.instances[platformName] = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders,
      },
    });

    this.setupInterceptors(platformName);
  }

  private setupInterceptors(platformName: string): void {
    const instance = this.instances[platformName];

    instance.interceptors.request.use(
      (config: AxiosRequestConfig | any) => {
        console.log(`Request to ${platformName}:`, config.url);
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error(`Error from ${platformName}:`, {
            status: error.response.status,
            url: error.response.config.url,
            data: error.response.data,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(platformName: string, token: string): void {
    const instance = this.instances[platformName];
    if (instance) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  public async get<T>(platformName: string, url: string, config?: AxiosRequestConfig): Promise<T> {
    const instance = this.getInstance(platformName);
    const res = await instance.get<T>(url, config);
    return res.data;
  }

  public async post<T, U>(platformName: string, url: string, data?: U, config?: AxiosRequestConfig): Promise<T> {
    const instance = this.getInstance(platformName);
    const res = await instance.post<T>(url, data, config);
    return res.data;
  }

  public async put<T, U>(platformName: string, url: string, data?: U, config?: AxiosRequestConfig): Promise<T> {
    const instance = this.getInstance(platformName);
    const res = await instance.put<T>(url, data, config);
    return res.data;
  }

  public async delete<T>(platformName: string, url: string, config?: AxiosRequestConfig): Promise<T> {
    const instance = this.getInstance(platformName);
    const res = await instance.delete<T>(url, config);
    return res.data;
  }

  public async patch<T, U>(platformName: string, url: string, data?: U, config?: AxiosRequestConfig): Promise<T> {
    const instance = this.getInstance(platformName);
    const res = await instance.patch<T>(url, data, config);
    return res.data;
  }

  private getInstance(platformName: string): AxiosInstance {
    const instance = this.instances[platformName];
    if (!instance) {
      throw new Error(`No API instance configured for platform: ${platformName}`);
    }
    return instance;
  }
}

const apiService = new ApiService();

export { apiService as Axios };
