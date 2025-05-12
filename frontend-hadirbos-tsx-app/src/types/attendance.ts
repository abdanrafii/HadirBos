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
};

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

export type AttendanceStat = {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  present: number;
  absent: number;
  leave: number;
  late: number;
  sick: number;
  daysWorked: number;
  totalWorkDays: number;
  attendanceRate: string;
};

export type AggregateStats = {
  totalDaysWorked: number;
  presentRate: number;
  absenceRate: number;
  leaveRate: number;
  lateRate: number;
  sickRate: number;
  avgAttendanceRate: number;
  avgDaysWorkedPerEmployee: number;
};

export type AttendanceStatsResponse = {
  totalEmployees: number;
  aggregateStats: AggregateStats;
  stats: AttendanceStat[];
};

export type EmployeeAttendanceSummary = {
  employeeId: string;
  name: string;
  department: string;
  attendanceRate: string;
};

export type AttendanceSummaryResponse = {
  topPerformers: EmployeeAttendanceSummary[];
  attendanceConcerns: EmployeeAttendanceSummary[];
};

export type AttendanceBreakdown = {
  present: number;
  late: number;
  leave: number;
  sick: number;
  absent: number;
};

export type DepartmentAttendanceStat = {
  department: string;
  employees: number;
  attendanceRate: string;
  turnoverRate: string;
  leaveRequests: number;
  resignations: number;
  attendanceBreakdown: AttendanceBreakdown;
};

export type DepartmentStatsResponse = {
  count: number;
  stats: DepartmentAttendanceStat[];
};

export type AttendanceTrend = {
  totalEmployees: number;
  trend: {
    year: number;
    month: number;
    presentRate: number;
    absentRate: number;
    leaveRate: number;
    lateRate: number;
    sickRate: number;
}[]
};