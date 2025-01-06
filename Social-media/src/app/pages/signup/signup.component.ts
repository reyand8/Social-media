import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, WritableSignal, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ModalWindowComponent } from './modalWindow/modal-window.component';
import {AuthService} from '../../auth/auth.service';


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

  form: FormGroup<ISignupForm> = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
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

  setPasswordVisibility(visibility: boolean) {
    return this.isPasswordVisible.set(visibility);
  }

  closeModal(): void {
    this.showModalWindow.set(false);
  }

  onOpenModal(): void {
    if (this.isMainFieldValid()) {
      this.showModalWindow.set(true);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.showModalWindow.set(false);
      const payload = this.form.value as Required<{
        firstName: string;
        lastName: string;
        password: string;
        description: string;
        hobbies: string[];
        profilePhoto: File | null;
      }>;
      this.authService.signup(payload).subscribe((res): void => {
        this.router.navigate([''])
      })
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
