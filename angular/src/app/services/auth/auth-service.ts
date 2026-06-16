import { inject, Injectable, signal } from '@angular/core';
import { Router} from '@angular/router';
import { User } from '../../shared/models/User'
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<{ token: string }>('/api/login', {
      username,
      password,
    });
  }

  register(username: string, email: string, password: string) {
    return this.http.post('/api/register', {
      username,
      email,
      password,
    });
  }

  loadCurrentUser() {
    return this.http.get<User>('/api/user').pipe(tap((user) => this.currentUser.set(user)));
  }

  initialize() {
    const token = localStorage.getItem('jwt');

    if (!token) {
      return;
    }

    this.loadCurrentUser().subscribe({
      error: () => {
        localStorage.removeItem('jwt');
        this.currentUser.set(null);
      },
    });
  }

  logout() {
    localStorage.removeItem('jwt');
    this.currentUser.set(null);

    //TODO temporary fix until data-access based on login is fully conceptualised
    window.location.reload();
    //this.router.navigate(['/']);
  }

  changePassword(
    oldPassword: string,
    newPassword: string
  ) {
    return this.http.put('/api/user/password', {
      oldPassword,
      newPassword,
    });
  }
  updateUser(
    data: Partial<User>
  ) {
    return this.http.put(
      '/api/user',
      data
    );
  }
}
