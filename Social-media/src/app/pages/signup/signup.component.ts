import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, WritableSignal, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ModalWindowComponent } from './modalWindow/modal-window.component';
import { AuthService } from '../../auth/auth.service';
import { ISignupPayload } from './signup.interface';


interface ISignupForm {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  password: FormControl<string | null>;
  description: FormControl<string | null>;
  hobbies: FormArray<FormControl<string>>;
  profilePhoto: FormControl<File | null>;
}

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
