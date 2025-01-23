import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, WritableSignal, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ModalWindowComponent } from './modalWindow/modal-window.component';
import { AuthService } from '../../auth/auth.service';
import { ISignupForm, ISignupPayload } from './signup.interface';


/**
 * This component provides a user registration form with the following features:
 * - Form fields for first name, last name, password, description, hobbies, and profile photo.
 * - Form validation, including required fields and minimum password length.
 * - A modal window for confirmation before submission.
 * - Integration with AuthService to handle user registration.
 * - Navigation to the login page after successful registration.
 *
 * Key Methods:
 * - `onSubmit()`: Handles form submission, validates the data, and sends it to the server.
 * - `onShowModalWindow()`: Opens the modal window if required fields are valid.
 * - `closeModal()`: Closes the modal window.
 * - `getPasswordError()`: Checks for password validation errors.
 * - `goToLogin()`: Navigates to the login page.
 *
 * Signals:
 * - `isPasswordVisible`: Controls the visibility of the password field.
 * - `showModalWindow`: Controls the visibility of the modal window.
 * - `errorMessage`: Stores error messages from the server.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ModalWindowComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false)
  showModalWindow: WritableSignal<boolean> = signal<boolean>(false)
  errorMessage:  WritableSignal<string> = signal<string>('')

  form: FormGroup<ISignupForm> = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    description: new FormControl('', Validators.required),
    hobbies: new FormArray<FormControl<string>>([], { validators: [Validators.required]}),
    profilePhoto: new FormControl<File | null>(null),
  });

  getShowModalWindow(): boolean {
    return this.showModalWindow();
  }

  getPasswordVisibility(): boolean {
    return this.isPasswordVisible();
  }

  setPasswordVisibility(visibility: boolean): void {
    return this.isPasswordVisible.set(visibility);
  }

  getPasswordError(): boolean | undefined {
    const passwordControl = this.form.get('password');
    return passwordControl?.hasError('minlength') && passwordControl.dirty;
  }

  onShowModalWindow(): void {
    if (this.isMainFieldValid()) {
      this.showModalWindow.set(true);
    }
  }

  closeModal(): void {
    this.showModalWindow.set(false);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.showModalWindow.set(false);
      const payload = this.form.value as Required<ISignupPayload>;
      this.authService.signup(payload).subscribe({
        next: (res) => {
          this.router.navigate(['']);
        },
        error: (err): void => {
          if (err.status.status === 400) {
            this.errorMessage.set(err.error.message);
          } else {
            this.errorMessage.set('Unrecognized error');
          }
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  isMainFieldValid(): boolean {
    const { firstName, lastName, password } = this.form.controls;
    return firstName.valid && lastName.valid && password.valid;
  }
}
