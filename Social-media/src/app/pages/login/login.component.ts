import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, WritableSignal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../auth/auth.service';
import { ILoginPayload } from '../../auth/auth.interface';


interface ILoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

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
        next: (res) => {
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
