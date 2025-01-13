import {Component, inject, signal, WritableSignal} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

import { ProfileService } from '../../data/services/profile.service';
import { Profile } from '../../data/interfaces/profile.interface';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import {IMyProfile, IMyProfileForm} from './profile.interface';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    NgIf,
    ImgUrlPipe,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileService: ProfileService = inject(ProfileService);
  myProfile$: Observable<null | Profile> = this.profileService.getMyProfile();
  isSuccessfully: WritableSignal<boolean> = signal<boolean>(false);

  form: FormGroup<IMyProfileForm> = new FormGroup({
    firstName: new FormControl('', { validators: Validators.required, nonNullable: true }),
    lastName: new FormControl('', { validators: Validators.required, nonNullable: true }),
    description: new FormControl('', { validators: Validators.required, nonNullable: true }),
    hobbies: new FormArray<FormControl<string>>([]),
  });

  constructor() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.myProfile$.subscribe(profile => {
      if (profile) {
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          description: profile.description,
        });
        const hobbiesArray = this.form.get('hobbies') as FormArray;
        hobbiesArray.clear();
        profile.hobby.forEach((hobby: string) => hobbiesArray.push(new FormControl(hobby)));
      }
    });
  }

  getFormError(): boolean {
    const controls = this.form.controls;
    return Object.keys(controls).some(controlName => {
      const control = controls[controlName as keyof IMyProfileForm] as AbstractControl;
      return control?.hasError('required') && control.dirty;
    });
  }

  addHobby(hobbyInput: HTMLInputElement): void {
    const hobbyItem: string = hobbyInput.value.trim();
    if (hobbyItem && !this.hobbies.controls.some(control => control.value === hobbyItem)) {
      this.hobbies.push(new FormControl(hobbyItem));
      hobbyInput.value = '';
    }
  }

  get hobbies(): FormArray {
    return this.form.get('hobbies') as FormArray;
  }

  removeHobby(index: number): void {
    this.hobbies.removeAt(index);
  }

  saveChanges(): void {
    if (this.form.valid) {
      const updatedProfile: Partial<IMyProfile> = {
        firstName: this.form.value.firstName,
        lastName: this.form.value.lastName,
        description: this.form.value.description,
        hobby: this.form.value.hobbies,
      };
      this.profileService.updateProfile(updatedProfile).subscribe({
        next: (profile): void => {
          this.isSuccessfully.set(true);
          this.form.patchValue(profile);
        },
        error: (error): void => {
          console.error('Failed to update profile', error);
        },
      });
    }
  }
}
