// auth.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, RegisterDto, LoginDto } from '../models/user.model';

interface JwtPayload {
  sub: string;
  name: string;
  exp: number; // Unix-Timestamp in Sekunden
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';
  private readonly base      = `${environment.apiUrl}/auth`;

  #token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  #user  = signal<User | null>(this.getInitialUser());

  isAuthenticated = computed(() => !!this.#token());
  currentToken    = computed(() => this.#token());
  currentUser     = computed(() => this.#user());

  private getInitialUser(): User | null {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.#token.set(token);
    this.#user.set(user);
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, dto).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, dto).pipe(
      tap(res => this.setSession(res.token, res.user))
    );
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.#user.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.#token.set(null);
    this.#user.set(null);
    this.router.navigate(['/auth/login']);
  }

  isTokenValid(): boolean {
    const token = this.#token();
    if (!token) return false;

    try {
      // JWT besteht aus Header.Payload.Signature – Base64url-dekodieren
      const payloadBase64 = token.split('.')[1];
      const payload: JwtPayload = JSON.parse(atob(payloadBase64));
      // exp ist Unix-Timestamp in Sekunden, Date.now() in Millisekunden
      return payload.exp * 1000 > Date.now();
    } catch {
      return false; 
    }
  }
}
