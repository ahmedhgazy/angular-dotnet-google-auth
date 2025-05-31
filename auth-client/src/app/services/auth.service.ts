import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl: string;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.getUserProfile().subscribe();
    }
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google`, { idToken });
  }

  login(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);

    const currentPath = window.location.pathname || '/';
    console.log(`Redirecting to ${this.apiUrl}/login with return URL: ${currentPath}`);
    window.location.href = `${this.apiUrl}/login?redirectUrl=${encodeURIComponent(currentPath)}`;
  }

  handleAuthentication(token: string): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      this.getUserProfile().subscribe();
    }
  }

  getUserProfile(): Observable<User | null> {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);

    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/'])
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
