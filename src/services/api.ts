import axios from "axios";
import { API_BASE_URL } from "../config";
import { getCookie } from "../utils/getCookie"; // Import the helper

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Add the CSRF token to headers for non-safe methods
    // Safe methods as defined by RFC7231 §4.2.1
    const unsafeMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (config.method && unsafeMethods.includes(config.method.toUpperCase())) {
      const csrfToken = getCookie("csrftoken"); // Get the token from the cookie
      if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers["X-CSRFToken"] = csrfToken;
      } else {
        console.warn("CSRF token not found in cookies.");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

// --- How to use it in components ---
// import apiClient from './services/api';
//
// const handleLogin = async (/* ... */) => {
//   try {
//      // Use the configured apiClient instance
//      const response = await apiClient.post('/api/auth/login/', { username, password, rememberMe });
//      // ... handle response
//   } catch (error) {
//      // ... handle error
//   }
// }
