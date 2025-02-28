import axios, { AxiosError } from "axios";

const BaseService = axios.create({
  timeout: 60000,
  // baseURL: appConfig.apiPrefix,
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

BaseService.interceptors.response.use(
  (response) => {
    if (response.data.status && response.data.status >= 400) {
      return Promise.reject(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default BaseService;
