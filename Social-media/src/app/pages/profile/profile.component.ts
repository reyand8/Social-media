import {Component, inject, signal, WritableSignal} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

import { ProfileService } from '../../data/services/profile.service';
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
  myProfile$: Observable<any> = this.profileService.getMyProfile();
  isSuccessfully: WritableSignal<boolean> = signal<boolean>(false);
  imagePreview: string | null = null;

  form: FormGroup<IMyProfileForm> = new FormGroup({
    firstName: new FormControl('', { validators: Validators.required, nonNullable: true }),
    lastName: new FormControl('', { validators: Validators.required, nonNullable: true }),
    description: new FormControl('', { validators: Validators.required, nonNullable: true }),
    hobby: new FormArray<FormControl<string>>([]),
    image: new FormControl<string | File | null>(null),
  });

  constructor() {
    this.initializeForm();
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector<HTMLInputElement>('.file-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  onImageSelected(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.get('image')?.setValue(file);

      const reader: FileReader = new FileReader();
      reader.onload = (): void => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  initializeForm(): void {
    this.myProfile$.subscribe(profile => {
      if (profile) {
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          description: profile.description,
          image: profile.image || null,
        });
        const hobbiesArray = this.form.get('hobby') as FormArray;
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
    if (hobbyItem && !this.hobby.controls.some(control => control.value === hobbyItem)) {
      this.hobby.push(new FormControl(hobbyItem));
      hobbyInput.value = '';
    }
  }

  get hobby(): FormArray {
    return this.form.get('hobby') as FormArray;
  }

  removeHobby(index: number): void {
    this.hobby.removeAt(index);
  }

  saveChanges(): void {
    if (this.form.valid) {
      const updatedProfile = this.form.value as Required<IMyProfile>;
      this.profileService.updateProfile(updatedProfile).subscribe({
        next: (profile: IMyProfile): void => {
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
