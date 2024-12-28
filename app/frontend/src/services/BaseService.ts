import axios from "axios";

const BaseService = axios.create({
  timeout: 60000,
  // baseURL: appConfig.apiPrefix,
  baseURL: "http://localhost:6060/api",
  withCredentials: true,
});

export default BaseService;
