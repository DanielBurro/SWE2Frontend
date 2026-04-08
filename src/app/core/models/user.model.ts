// user.model.ts

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface RegisterDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}