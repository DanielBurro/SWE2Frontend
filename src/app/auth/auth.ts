import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegisterDto } from '../core/models/user.model';

interface AuthResponse {
  token: string;
}

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

interface AuthResponse {
  token: string;
  user: User; // Das kommt jetzt vom Backend mit
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // 1. Private Writable Signals (Die Quelle der Wahrheit)
  #token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  #user = signal<User | null>(this.getInitialUser());

  // 2. Public Read-Only Signals (Für die Komponenten)
  // isAuthenticated ist true, wenn ein Token existiert UND nicht abgelaufen ist
  isAuthenticated = computed(() => !!this.#token());

  // Die User-Daten direkt als Signal verfügbar machen
  currentToken = computed(() => this.#token());
  currentUser = computed(() => this.#user());

  private getInitialUser(): User | null {
    const savedUser = localStorage.getItem(this.USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.setSession(response.token, response.user);
      }),
    );
  }

  private setSession(token: string, user: User) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.#token.set(token);
    this.#user.set(user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.#token.set(null);
    this.#user.set(null);
    this.router.navigate(['/login']);
  }

  // Hilfsmethode, falls man die Daten manuell vom Server auffrischen will
  refreshUser() {
    return this.http
      .get<User>('/api/users/me')
      .pipe(
        tap((user) => {
          this.#user.set(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
      )
      .subscribe();
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.base}/register`, dto);
  }
}
