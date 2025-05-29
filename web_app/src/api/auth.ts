import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const login = async (data: { email: string; password: string }) => {
  return axios.post(`${API_URL}/login/`, data);
};

export const logout = async () => {
  localStorage.removeItem("token");
  return axios.post(`${API_URL}/logout/`, {}, { withCredentials: true });
}

export const register = async (data: {
  nom_complet: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  return axios.post(`${API_URL}/register/`, data);
};

export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
      return token;
}
 

export const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null;
}

export const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user);
}


export const isAdmin = () => {
  const user = getUser();
  if (!user) return false;
  return isAuthenticated() && user.est_admin === true;
}