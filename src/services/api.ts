import axios from "axios";
import { API_BASE_URL } from "../config";
import { getCookie } from "../utils/getCookie";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const unsafeMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (config.method && unsafeMethods.includes(config.method.toUpperCase())) {
      const csrfToken = getCookie("csrftoken");
      if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers["X-CSRFToken"] = csrfToken;
      } else {
        console.warn("CSRF token not found in cookies.");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
