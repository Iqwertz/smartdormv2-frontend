// Configure Axios so all requests automatically include credentials

import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies to be sent
});

export default api;
