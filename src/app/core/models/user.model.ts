// user.model.ts

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  bio?: string;
  profilePicUrl?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  profilePicUrl?: string;
}

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  profilePicUrl?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}