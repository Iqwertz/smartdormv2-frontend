import api from "./axiosConfig";

export const login = async (email: string, password: string, rememberMe: boolean) => {
  await api.post("/login", { email, password, rememberMe });
};

export const checkAuth = async () => {
  const response = await api.get("/me"); // Backend returns user info if authenticated
  return response.data; // Expected: { role: "admin" | "tenant" }
};

export const logout = async () => {
  await api.post("/logout");
};
