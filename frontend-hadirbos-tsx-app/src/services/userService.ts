import axios from "axios";
import { UserData } from "../types/user";

const BASE_URL = "http://localhost:5000/api/users";

export const getUsers = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${BASE_URL}`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
    throw new Error("An unexpected error occurred");
  }
};

export const deleteUser = async (userId: string, token: string) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.delete(`${BASE_URL}/${userId}`, config);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
    throw new Error("An unexpected error occurred");
  }
};

export const updateUser = async (
  userId: string | undefined,
  userPayload: Partial<UserData>,
  token: string
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.put(`${BASE_URL}/${userId}`, userPayload, config);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update user");
    }
    throw new Error("An unexpected error occurred");
  }
};

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  position: string;
};
export const createUser = async (
  userPayload: CreateUserPayload,
  token: string
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.post(`${BASE_URL}`, userPayload, config);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create user");
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getUserById = async (id: string | undefined, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
    throw new Error("An unexpected error occurred");
  }
};
