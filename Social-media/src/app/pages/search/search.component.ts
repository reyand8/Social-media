import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime, defaultIfEmpty,
  distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';

import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card.component';
import { ProfileService } from '../../data/services/profile.service';
import { IProfile } from '../../data/interfaces/profile.interface';


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
 * - `onPhotoSelected(event)`: Handles profile photo selection and updates the `profilePhoto`
 * form control with a file. Generates a preview of the selected image.
 *
 * Getters:
 * - `hobbies`: Retrieves the `FormArray` for hobbies from the parent form.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ProfileCardComponent, AsyncPipe, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  profileService: ProfileService = inject(ProfileService);
  searchForm:  FormGroup<{search: FormControl<string | null>}> =
    new FormGroup({
      search: new FormControl(''),
  });

  filteredProfiles$: Observable<IProfile[]>;
  myProfile$: Observable<IProfile | null> = this.profileService.getMyProfile();
  followingIds$: Observable<number[]>;


  constructor() {
    this.filteredProfiles$ = this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value: string | null) => typeof value === 'string' && value.length >= 3),
      switchMap((searchString: string | null) =>
        searchString ? this.profileService.searchProfiles(searchString) : []
      )
    );

    this.followingIds$ = this.myProfile$.pipe(
      switchMap((profile: IProfile | null) =>
        profile ? this.profileService.getFollowingId(String(profile.id)) : []
      ),
      map(ids => ids ? ids.map(id => Number(id)) : []),
      defaultIfEmpty([])
    );
  }
}
