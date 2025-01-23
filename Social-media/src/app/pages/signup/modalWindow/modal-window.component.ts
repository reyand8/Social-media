import {FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


/**
 * This component represents a modal window that interacts with a parent form to collect
 * and manage additional user input.
 *
 * Key Features:
 * - Displays a modal window controlled by the `showModalWindow` input property.
 * - Emits events for closing the modal and submitting the form using `closeModalEvent` and `submitFormEvent`.
 * - Allows users to add hobbies dynamically to a `FormArray`.
 * - Handles file input for profile photo uploads with a live preview.
 *
 * Inputs:
 * - `parentForm`: A reference to the parent form (FormGroup) for data binding.
 * - `showModalWindow`: A boolean controlling the visibility of the modal window.
 *
 * Outputs:
 * - `closeModalEvent`: Emits when the modal is closed.
 * - `submitFormEvent`: Emits when the form is submitted.
 *
 * Methods:
 * - `closeModal()`: Emits the `closeModalEvent` to notify the parent component to close the modal.
 * - `onSubmit()`: Emits the `submitFormEvent` to notify the parent component of form submission.
 * - `addHobby(hobbyInput)`: Adds a hobby to the `hobbies` FormArray if it is not already present.
 * - `removeHobby(index)`: Removes a hobby from the `hobbies` FormArray.
 * - `onPhotoSelected(event)`: Handles profile photo selection and updates the `profilePhoto` form control with a file. Generates a preview of the selected image.
 *
 * Getters:
 * - `hobbies`: Retrieves the `FormArray` for hobbies from the parent form.
 */


@Component({
  selector: 'app-modal-window',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss'
})
export class ModalWindowComponent {
  @Input() parentForm!: FormGroup;
  @Input() showModalWindow: boolean = false;
  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() submitFormEvent: EventEmitter<void> = new EventEmitter<void>();

  photoPreview: string | null = null;

  constructor() {}

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  onSubmit(): void {
    this.submitFormEvent.emit();
  }

  addHobby(hobbyInput: HTMLInputElement): void {
    const hobby: string = hobbyInput.value.trim();
    if (hobby && !this.hobbies.controls.some(control => control.value === hobby)) {
      this.hobbies.push(new FormControl(hobby));
      hobbyInput.value = '';
    }
  }

  get hobbies(): FormArray {
    return this.parentForm.get('hobbies') as FormArray;
  }

  removeHobby(index: number): void {
    this.hobbies.removeAt(index);
  }

  onPhotoSelected(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.parentForm.get('profilePhoto')?.setValue(file);
      const reader: FileReader = new FileReader();
      reader.onload = (): void => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
