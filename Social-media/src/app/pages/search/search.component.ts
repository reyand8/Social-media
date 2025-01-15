import {Component, inject} from '@angular/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Observable, switchMap} from 'rxjs';

import {ProfileCardComponent} from '../../common-ui/profile-card/profile-card.component';
import {ProfileService} from '../../data/services/profile.service';
import {IProfile} from '../../data/interfaces/profile.interface';


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
  myProfile$: Observable<null | IProfile> = this.profileService.getMyProfile();
  followingIds: number[] = [];

  constructor() {
    this.filteredProfiles$ = this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value: string | null) => {
        return typeof value === 'string' && value.length >= 3;
      }),
      switchMap((searchString: string | null) =>
        searchString ? this.profileService.searchProfiles(searchString) : []
      )
    );

    this.myProfile$.subscribe((profile: IProfile | null): void => {
      if (profile) {
        this.profileService.getFollowingId(String(profile.id)).subscribe((ids: number[]): void => {
          this.followingIds = ids.map(id => Number(id));
        });
      }
    });
  }
}
