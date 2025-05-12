import axios from "axios"
import type { SubmissionFormData } from "../types/submission"

const BASE_URL = "http://localhost:5000/api/submissions"
const FILE_URL = "http://localhost:5000/api/files"

// Upload a file
export const uploadFile = async (file: File, token: string) => {
  const formData = new FormData()
  formData.append("file", file)

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.post(`${FILE_URL}/upload`, formData, config)
    return response.data.fileUrl
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to upload file")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Create a new submission
export const createSubmission = async (submissionData: SubmissionFormData, token: string) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.post(BASE_URL, submissionData, config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create submission")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Get all submissions for the current employee
export const getEmployeeSubmissions = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.get(`${BASE_URL}/employee`, config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch submissions")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Get all submissions (admin only)
export const getAllSubmissions = async (
  token: string,
  filters?: { type?: string; status?: string; employeeId?: string },
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filters,
  }

  try {
    const response = await axios.get(BASE_URL, config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch submissions")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Update submission status (admin only)
export const updateSubmissionStatus = async (
  submissionId: string,
  status: "pending" | "approved" | "rejected",
  adminNotes: string,
  token: string,
) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.put(`${BASE_URL}/${submissionId}`, { status, adminNotes }, config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update submission status")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Get submission by ID
export const getSubmissionById = async (submissionId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.get(`${BASE_URL}/${submissionId}`, config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch submission")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Get submission statistics (admin only)
export const getSubmissionStats = async (
  token: string,
  month?: number,
  year?: number,
  period?: string
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const params = new URLSearchParams();
  if (month !== undefined) params.append("month", month.toString());
  if (year !== undefined) params.append("year", year.toString());
  if (period) params.append("period", period);

  try {
    const response = await axios.get(`${BASE_URL}/stats?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch submission statistics"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const getSubmissionTrend = async (token: string, month?: number, year?: number, period?: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const params = new URLSearchParams();
  if (month !== undefined) params.append("month", month.toString());
  if (year !== undefined) params.append("year", year.toString());
  if (period) params.append("period", period);

  try {
    const response = await axios.get(`${BASE_URL}/trend?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch submission trend");
    }
    throw new Error("An unexpected error occurred");
  }
};