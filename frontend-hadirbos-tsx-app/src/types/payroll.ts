export type Payroll = {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    department: string;
    position: string;
    baseSalary: number;
  };
  status: "unpaid" | "paid";
  month: number;
  year: number;
  deductions: number;
  bonus: number;
  tax: number;
  totalAmount: number;
  paymentDate: Date;
  paymentMethod: "bank" | "cash" | "check";
  paymentReference: string;
  notes: string;
};

export type PayrollStats = {
  payrollTotals: {
    baseSalary: number;
    deductions: number;
    bonus: number;
    tax: number;
    totalAmount: number;
  };
  avgBaseSalary: number;
  avgBonus: number;
  avgTax: number;
  avgDeductions: number;
  avgTotalAmount: number;
  employeesWithBonus: number;
  employeesWithDeductions: number;
  highestSalary: number;
  lowestSalary: number;
  bonusToSalaryRatio: number;
  totalEmployees: number;
};

export type PayrollTrend = {
  trend: {
    year: number;
    month: number;
    totalBaseSalary: number;
    totalBonus: number;
    totalDeductions: number;
    totalTax: number;
    totalPayroll: number;
    count: number;
  }[];
}