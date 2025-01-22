import { Component, inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card.component';
import { ProfileService } from '../../data/services/profile.service';
import { IProfile } from '../../data/interfaces/profile.interface';


@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ProfileCardComponent, AsyncPipe, NgForOf, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  profileService: ProfileService = inject(ProfileService);

  followingIds: number[] = [];

  profiles$: Observable<IProfile[]> = this.profileService.getProfiles().pipe(
    map((response) => {
      if ('error' in response) {
        throw new Error(response.error);
      }
      return response;
    }),
    catchError((error) => {
      console.error('Error fetching profiles:', error.message);
      return of([]);
    })
  );

  myProfile$: Observable<IProfile | null> = this.profileService.getMyProfile().pipe(
    switchMap((profile: IProfile | null) => {
      if (profile) {
        return this.loadFollowingIds(String(profile.id)).pipe(
          map(() => profile)
        );
      }
      return of(null);
    })
  );

  private loadFollowingIds(profileId: string): Observable<number[]> {
    return this.profileService.getFollowingId(profileId).pipe(
      map((ids: number[]) => ids.map((id) => Number(id))),
      catchError(() => of([]))
    );
  }

  trackById(index: number, profile: IProfile): number {
    return profile.id;
  }
}
