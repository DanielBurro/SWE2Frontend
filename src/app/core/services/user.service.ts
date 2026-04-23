// user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, RegisterDto, UpdateUserDto, ChangePasswordDto } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`);
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.base}/register`, dto);
  }

  update(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, dto);
  }

  changePassword(id: number, dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/password`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
