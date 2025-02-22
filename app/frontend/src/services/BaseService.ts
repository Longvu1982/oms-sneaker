import axios, { AxiosError } from "axios";

const BaseService = axios.create({
  timeout: 60000,
  // baseURL: appConfig.apiPrefix,
  baseURL: "http://localhost:6060/api",
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
