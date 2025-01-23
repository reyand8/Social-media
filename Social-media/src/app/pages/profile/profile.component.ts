import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ProfileService } from '../../data/services/profile.service';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import { IMyProfile, IMyProfileForm } from './profile.interface';
import { SvgComponent } from '../../common-ui/svg/svg.component';
import { IUpdateProfile } from '../../data/interfaces/profile.interface';


/**
 * Manages the user's profile: displays, updates, and removes it.
 * Supports image upload, hobby management, and form validation.
 *
 * Properties:
 * - `myProfile$`: Observable for profile data.
 * - `isSuccessfully`: Signal indicating profile update success.
 * - `imagePreview`: Base64 string for image preview.
 * - `form`: The profile form group.
 *
 * Methods:
 * - `initializeForm()`: Initializes the form with profile data.
 * - `onImageSelected()`: Handles image input and preview.
 * - `triggerFileInput()`: Triggers file input programmatically.
 * - `addHobby()`: Adds a hobby to the list if not a duplicate.
 * - `removeHobby()`: Removes a hobby by index.
 * - `saveChanges()`: Submits profile data to the backend.
 * - `removeMyProfile()`: Deletes the profile and redirects to login.
 *
 * Workflow:
 * 1. Initializes form with profile data.
 * 2. Allows editing, hobby management, and image upload.
 * 3. Saves updates to backend and handles errors.
 * 4. Optionally, removes the profile and redirects to login.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    NgIf,
    ImgUrlPipe,
    ReactiveFormsModule,
    SvgComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileService: ProfileService = inject(ProfileService);
  router: Router = inject(Router);

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
    const fileInput: HTMLInputElement | null = document.querySelector<HTMLInputElement>('.file-input');
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
        this.updateHobbies(profile.hobby);
      }
    });
  }

  updateHobbies(hobbies: string[]): void {
    const hobbiesArray = this.hobby;
    hobbiesArray.clear();
    hobbies.forEach((hobby: string) => hobbiesArray.push(new FormControl(hobby)));
  }

  getFormError(): boolean {
    return Object.values(this.form.controls).some(control => control.hasError('required') && control.dirty);
  }

  addHobby(hobbyInput: HTMLInputElement): void {
    const hobbyItem: string = hobbyInput.value.trim();
    if (hobbyItem && !this.hobby.controls.some(control => control.value === hobbyItem)) {
      this.hobby.push(new FormControl(hobbyItem));
      hobbyInput.value = '';
    }
  }

  get hobby(): FormArray {
    return this.form.get('hobby') as FormArray<FormControl<string>>;
  }

  removeHobby(index: number): void {
    if (index >= 0 && index < this.hobby.length) {
      this.hobby.removeAt(index);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  saveChanges(): void {
    if (this.form.valid) {
      const updatedProfile: IMyProfile = this.prepareProfileForUpdate();
      this.profileService.updateProfile(updatedProfile).subscribe({
        next: (profile: IUpdateProfile): void => {
          this.isSuccessfully.set(true);
          this.form.patchValue(profile);
        },
        error: this.handleError.bind(this),
      });
    }
  }

  prepareProfileForUpdate(): IMyProfile {
    const updatedProfile: Required<IMyProfile> = { ...this.form.value } as Required<IMyProfile>;
    if (typeof updatedProfile.image === 'string') {
      delete updatedProfile.image;
    }
    return updatedProfile;
  }

  removeMyProfile() {
    this.profileService.removeMyProfile().subscribe({
      next: (): void => {
        this.router.navigate(['/login']);
      },
      error: (err): void => {
        console.error('Error removing profile:', err);
      }
    });
  }

  handleError(error: any): void {
    console.error('Error: ', error);
  }
}
