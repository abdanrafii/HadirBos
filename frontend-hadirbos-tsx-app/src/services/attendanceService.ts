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
  employeeId: string;
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

export const updateAttendance = async (
  attendanceId: string,
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
    const response = await axios.put(
      `${BASE_URL}/attendance/${attendanceId}`,
      attendancePayload,
      config
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update attendance"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getAttendanceById = async (
  attendanceId: string ,
  token: string
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(
      `${BASE_URL}/attendance/${attendanceId}`,
      config
    );
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

export const getAllAttendance = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${BASE_URL}/attendance/all`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch all attendance"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getAttendanceStats = async (token: string, employeeId: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${BASE_URL}/attendance/stats/employee/${employeeId}`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch attendance stats"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getAttendanceByEmployeeId = async (
  token: string,
  employeeId: string,
  month: number,
  year: number
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(
      `${BASE_URL}/attendance/employee/${employeeId}?month=${month}&year=${year}`,
      config
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch attendance by employee ID"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};
