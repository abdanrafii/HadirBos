import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const getAttendance = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${BASE_URL}/attendance`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch attendance"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

type AttendancePayload = {
  status: string;
  note: string;
  employeeId: string | undefined;
};

export const postAttendance = async (
  attendancePayload: AttendancePayload,
  token: string
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/attendance`,
      attendancePayload,
      config
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to submit attendance"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};
