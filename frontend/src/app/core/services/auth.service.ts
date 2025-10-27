import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5256/api/Auth';
  private readonly TOKEN_KEY = 'access_token';

  constructor(private http: HttpClient, private router: Router) {}

  // Espera { token: string } ou { accessToken: string } — verifique a resposta do backend
  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response) => {
        // normalize: tenta as propriedades comuns
        const token = response?.accessToken ?? response?.token ?? response?.access_token;
        if (!token) {
          throw new Error('Token não encontrado na resposta do servidor');
        }
        localStorage.setItem(this.TOKEN_KEY, token);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isAuthenticated$() {
    return of(this.isAuthenticated());
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp ? payload.exp * 1000 : 0;
      return exp ? Date.now() > exp : false;
    } catch {
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
