import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserRole } from '../model/user.model';
import { SeedService } from './seed.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private seedService = inject(SeedService);
  private readonly SESSION_KEY = 'jt_active_session_v1';

  // Angular Signal holding current logged-in user
  private currentUserSignal = signal<User | null>(this.loadSessionUser());

  // Public computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor() {
    this.seedService.initializeDemoData();
  }

  private loadSessionUser(): User | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private getStoredUsers(): User[] {
    const raw = localStorage.getItem(this.seedService.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  login(email: string, password: string): Observable<User> {
    const users = this.getStoredUsers();
    const matched = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (!matched) {
      return throwError(() => new Error('Invalid email or password.')).pipe(delay(300));
    }

    return of(matched).pipe(
      delay(350),
      tap(user => {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  register(payload: { fullName: string; email: string; password: string; role: UserRole }): Observable<User> {
    const users = this.getStoredUsers();
    const exists = users.some(u => u.email.toLowerCase() === payload.email.trim().toLowerCase());

    if (exists) {
      return throwError(() => new Error('An account with this email already exists.')).pipe(delay(300));
    }

    const newUser: User = {
      id: 'u-' + Date.now(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(this.seedService.USERS_KEY, JSON.stringify(users));

    return of(newUser).pipe(
      delay(350),
      tap(user => {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    return of(this.getStoredUsers()).pipe(delay(200));
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}