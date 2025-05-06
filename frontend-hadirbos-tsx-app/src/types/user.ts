export type UserBase = {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  baseSalary: number;
  phone: string;
  address: string;
  accountNumber: string;
};

export type UserData = UserBase & {
  password: string;
};

export type UserInfo = UserBase & {
  token: string;
};

export type User = UserBase & {
  status: string;
  joinDate: string;
  createdAt: string;
};
