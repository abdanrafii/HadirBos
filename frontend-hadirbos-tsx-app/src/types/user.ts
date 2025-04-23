export type UserBase = {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
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
  phone: string;
  address: string;
};
