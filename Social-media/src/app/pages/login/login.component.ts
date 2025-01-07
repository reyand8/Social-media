import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, WritableSignal, inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {AuthService} from '../../auth/auth.service';


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

  form: FormGroup<ILoginForm> = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required),
  });

  onSubmit(): void {
    if (this.form.valid) {
      const payload: {username: string, password: string} = this.form.value as { username: string; password: string };
      this.authService.login(payload).subscribe(res => {
        this.router.navigate([''])
      })
    }
  }

  getPasswordVisibility(): boolean {
    return this.isPasswordVisible();
  }

  setPasswordVisibility(visibility: boolean) {
    return this.isPasswordVisible.set(visibility);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
