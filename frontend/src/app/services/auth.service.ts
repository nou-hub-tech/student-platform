import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse } from '../models';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 400) {
        errorMessage = 'Bad request';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden - check server configuration';
      } else if (error.status === 500) {
        errorMessage = 'Server error';
      } else {
        errorMessage = `Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  testBackend(): Observable<any> {
    console.log('Testing backend connectivity...');
    return this.http.get(`${this.API_URL}/test`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  testPost(): Observable<any> {
    console.log('Testing POST request...');
    const testData = { test: 'data', message: 'Hello from Angular' };
    return this.http.post(`${this.API_URL}/test-post`, testData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  testDatabase(): Observable<any> {
    console.log('Testing database connectivity...');
    return this.http.get(`${this.API_URL}/db-test`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Sending login request:', credentials);
    console.log('Request URL:', `${this.API_URL}/login`);
    console.log('Request headers:', this.getHeaders());
    
    return this.http.post<any>(`${this.API_URL}/login`, credentials, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('Login response:', response);
          // Handle the new response format
          const loginResponse: LoginResponse = {
            token: response.token
          };
          
          localStorage.setItem('token', response.token);
          
          // Store user information
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
          
          return loginResponse;
        }),
        catchError(this.handleError)
      );
  }

  register(user: User): Observable<User> {
    console.log('Sending registration request:', user);
    console.log('Request URL:', `${this.API_URL}/register`);
    console.log('Request headers:', this.getHeaders());
    
    return this.http.post<any>(`${this.API_URL}/register`, user, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('Registration response:', response);
          // Handle the new response format
          return response.user || user;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`)
      .pipe(catchError(this.handleError));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isStudent(): boolean {
    return this.hasRole('ROLE_STUDENT');
  }
} 