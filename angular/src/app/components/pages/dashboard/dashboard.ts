import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth-service';
import { matchFieldsValidator } from '../../../validators/match-fields.validator';
import { passwordChangeValidator } from '../../../validators/password-change.validator';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private fb = inject(FormBuilder).nonNullable;
  authService = inject(AuthService);

  loading = false;
  error: string | null = null;

  //TODO Email validation doesnt work on email and emailConfirmation
  dashboardForm = this.fb.group({
    profile: this.fb.group(
      {
        firstName: [''],
        lastName: [''],
        email: ['', Validators.email],
        emailConfirmation: ['', Validators.email],
      },
      {
        validators: matchFieldsValidator('email', 'emailConfirmation'),
      },
    ),

    password: this.fb.group(
      {
        oldPassword: [''],
        newPassword: [''],
        newPasswordConfirmation: [''],
      },
      {
        validators: [
          matchFieldsValidator('newPassword', 'newPasswordConfirmation'),
          passwordChangeValidator('oldPassword', 'newPassword', 'newPasswordConfirmation'),
        ],
      },
    ),
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (!user) {
        return;
      }

      this.dashboardForm.controls.profile.patchValue({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
      });
    });
  }

  save() {
    this.loading = true;
    const requests = [];
    const profile = this.dashboardForm.controls.profile;
    const password = this.dashboardForm.controls.password;

    const payload: UpdateUserRequest = {};

    Object.entries(profile.controls).forEach(([key, control]) => {
      if (control.dirty) {
        payload[key as keyof UpdateUserRequest] = control.value;
      }
    });

    if (Object.keys(payload).length > 0) {
      requests.push(
        this.authService.updateUser(payload)
      );
    }

    if (password.dirty && password.controls.newPassword.value) {
      requests.push(
        this.authService
          .changePassword(password.controls.oldPassword.value, password.controls.newPassword.value)
      );
    }

    if (requests.length === 0) {
      this.loading = false;
      return;
    }

    // TODO UI Messages and change "oldPassword" field to only pop-up upon trying to change newPassword
    // TODO see emailConfirmation, maybe even confirmation-dialogue?
    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.dashboardForm.markAsPristine();

          this.authService.loadCurrentUser().subscribe();
        },
        error: (error) => {
          this.error = error?.error?.message ?? 'Saving failed';
        },
      });
  }
}
