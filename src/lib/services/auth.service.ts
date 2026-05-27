import api from "./api";

export const loginAdmin = async (email: string, password: string) => {
  const response = await api.post("/api/auth/login", { email, password });
  const { access_token } = response.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("stocktrack_token", access_token);
  }
  return response.data;
};

export const registerAdmin = async (email: string, password: string, fullName: string) => {
  const response = await api.post("/api/auth/register", {
    email,
    password,
    name: fullName,
  });
  const { access_token } = response.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("stocktrack_token", access_token);
  }
  return response.data;
};

export const logoutUser = async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("stocktrack_token");
    localStorage.removeItem("stocktrack_active_business_id");
  }
};
