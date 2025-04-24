export type Attendance = {
  _id: string;
  employeeId: string;
  status: AttendanceStatus;
  note: string;
  date: string;
  createdAt: string;
};

export type AttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "late"
  | "sick"
  | "weekend";
