import {Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {Observable} from 'rxjs';

import {ProfileCardComponent} from '../../common-ui/profile-card/profile-card.component';
import {ProfileService} from '../../data/services/profile.service';
import {Profile} from '../../data/interfaces/profile.interface';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ProfileCardComponent, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  profileService: ProfileService = inject(ProfileService)
  profiles$: Observable<Profile[]> = this.profileService.getProfiles();
  myProfile$: Observable<null | Profile> = this.profileService.getMyProfile();
  followingIds: number[] = [];

  constructor() {
    this.myProfile$.subscribe((profile: Profile | null): void => {
      if (profile) {
        this.profileService.getFollowingId(String(profile.id)).subscribe((ids): void => {
          this.followingIds = ids.map(id => Number(id));
        });
      }
    });
  }
}
