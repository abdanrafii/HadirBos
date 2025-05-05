import type { UserBase } from "./user"

export type SubmissionType = "leave" | "resignation"
export type SubmissionStatus = "pending" | "approved" | "rejected"

export interface Submission {
  _id: string
  employeeId: string | UserBase
  type: SubmissionType
  reason: string
  startDate?: string
  endDate?: string
  status: SubmissionStatus
  fileUrl?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SubmissionFormData {
  type: SubmissionType
  reason: string
  startDate?: string
  endDate?: string
  fileUrl?: string
}

export interface SubmissionStats {
  leave: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
  resignation: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
  total: {
    pending: number
    approved: number
    rejected: number
    total: number
  }
}
