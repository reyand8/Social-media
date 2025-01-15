import {Component, inject} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {catchError, map, Observable} from 'rxjs';

import {ProfileCardComponent} from '../../common-ui/profile-card/profile-card.component';
import {ProfileService} from '../../data/services/profile.service';
import {IProfile} from '../../data/interfaces/profile.interface';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ProfileCardComponent, AsyncPipe, NgForOf, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  profileService: ProfileService = inject(ProfileService)
  profiles$: Observable<IProfile[]> = this.profileService.getProfiles().pipe(
    map((response) => {
      if ('error' in response) {
        throw new Error(response.error);
      }
      return response;
    }),
    catchError((error) => {
      console.error('Error fetching profiles:', error.message);
      return [];
    })
  );
  myProfile$: Observable<null | IProfile> = this.profileService.getMyProfile();
  followingIds: number[] = [];

  constructor() {
    this.myProfile$.subscribe((profile: IProfile | null): void => {
      if (profile) {
        this.profileService.getFollowingId(String(profile.id)).subscribe((ids): void => {
          this.followingIds = ids.map(id => Number(id));
        });
      }
    });
  }

  trackById(index: number, profile: IProfile): number {
    return profile.id;
  }
}
