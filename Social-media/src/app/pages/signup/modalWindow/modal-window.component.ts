import {FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


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
