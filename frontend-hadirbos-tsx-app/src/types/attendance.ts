export type Attendance = {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    position: string;
    department: string;
  } | null;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt: string;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "late"
  | "sick"
  | "weekend";

export type AttendanceStats = {
  present: number;
  absent: number;
  leave: number;
  late: number;
  sick: number;
  daysWorked: number;
  totalWorkDays: number;
  attendanceRate: string;
};