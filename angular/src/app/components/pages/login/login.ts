import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth-service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('LOGIN ROUTE');

    this.loading = true;
    this.error = null;

    // TODO Login Error Handling. Currently the page just stops (symfony might crash/throw an exception
    //  before angular handles the response)
    this.authService
      .login(this.form.controls.username.value, this.form.controls.password.value)
      .pipe(finalize(() =>  {this.loading = false;console.log('FINALIZE');}))
      .subscribe({
        next: (response) => {
          localStorage.setItem('jwt', response.token);

          this.authService.loadCurrentUser().subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/']);
            },
          });
        },

        error: (error) => {
          this.loading = false;
          if (error.status === 401) {
            this.error = 'Invalid username or password';
          } else {
            this.error = 'Something went wrong. Please try again later.';
          }
        },
      });
  }
}
