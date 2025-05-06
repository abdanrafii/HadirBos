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
