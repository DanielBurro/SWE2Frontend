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

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}