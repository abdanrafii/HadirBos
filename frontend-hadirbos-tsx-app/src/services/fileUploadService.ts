import axios from "axios"

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

// Get file URL for display
export const getFileUrl = (fileUrl: string | undefined): string => {
  if (!fileUrl) return ""

  // If it's already a full URL, return it
  if (fileUrl.startsWith("http")) {
    return fileUrl
  }

  // Otherwise, prepend the base URL
  return `http://localhost:5000${fileUrl}`
}
