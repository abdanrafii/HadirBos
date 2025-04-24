import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    localStorage.setItem("userInfo", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw new Error("An unexpected error occurred");
  }
};

export const logout = (navigate: (path: string) => void) => {
  localStorage.removeItem("userInfo");
  navigate("/login");
};

export const getCurrentUser = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const getProfile = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${BASE_URL}/profile`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
    throw new Error("An unexpected error occurred");
  }
};
