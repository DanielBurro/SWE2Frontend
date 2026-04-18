import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';

// Interface für die Antwort deines Backends
interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';

  // State: Wir initialisieren das Signal direkt mit dem Token aus dem Speicher
  #token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  // Public Signals (Read-only für Komponenten)
  currentUser = computed(() => this.#token());
  isAuthenticated = computed(() => !!this.#token());

  /**
   * Sendet Login-Daten an das Backend
   */
  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.setSession(response.token);
      }),
      catchError((err) => {
        console.log(err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Loggt den User aus und räumt auf
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.#token.set(null);
    this.router.navigate(['/login']).then();
  }

  /**
   * Interner Helfer zum Setzen des Tokens
   */
  private setSession(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.#token.set(token);
  }
}
