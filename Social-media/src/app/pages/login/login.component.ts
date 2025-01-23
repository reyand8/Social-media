import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, WritableSignal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../auth/auth.service';
import { ILoginPayload, ITokenResponse } from '../../auth/auth.interface';
import {ILoginForm} from './login.interface';


/**
 * LoginComponent
 *
 * This component implements a login form. It includes input fields for
 * the username and password, as well as a submit button.
 * The component also handles password visibility toggling, error handling,
 * and navigation upon successful authentication.
 *
 * Variables:
 * - `isPasswordVisible`: A signal controlling the visibility of the password.
 * - `errorMessage`: A signal displaying error messages during authentication.
 * - `form`: A form group for user input containing `username` and `password` fields, validated through validators.
 *
 * Methods:
 * - `onSubmit()`: Submits the form for authentication, handles errors.
 * - `getPasswordVisibility()`: Returns the current password visibility state.
 * - `setPasswordVisibility(visibility: boolean)`: Sets the password visibility state.
 * - `goToSignup()`: Navigates the user to the signup page.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);

  isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false)
  errorMessage:  WritableSignal<string> = signal<string>('')

  form: FormGroup<ILoginForm> = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required),
  });

  onSubmit(): void {
    if (this.form.valid) {
      const payload: ILoginPayload = this.form.value as ILoginPayload;
      this.authService.login(payload).subscribe({
        next: (res: ITokenResponse) => {
          this.router.navigate(['']);
        },
        error: (err): void => {
          if (err.status === 401) {
            this.errorMessage.set(err.error.message);
          } else {
            this.errorMessage.set('Unrecognized error');
          }
        },
      });
    }
  }

  getPasswordVisibility(): boolean {
    return this.isPasswordVisible();
  }

  setPasswordVisibility(visibility: boolean): void {
    return this.isPasswordVisible.set(visibility);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
