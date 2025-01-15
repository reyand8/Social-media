import {Component, inject, Input} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, Observable, of} from 'rxjs';

import {IProfile} from '../../data/interfaces/profile.interface';
import {ImgUrlPipe} from '../../helpers/pipes/img-url.pipe';
import {ProfileService} from '../../data/services/profile.service';


@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  standalone: true,
  imports: [
    ImgUrlPipe,
    AsyncPipe,
    NgIf,
    NgForOf,
    RouterLink
  ],
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  profileService: ProfileService = inject(ProfileService)

  @Input() profile!: IProfile;
  @Input() myProfile$!: Observable<IProfile | null>;
  @Input() followingIds!: number[];

  errorMessage: string | null = null;


  followPerson(followedPerson: IProfile): void {
    this.profileService.followPerson(followedPerson).pipe(
      catchError((error): Observable<null> => {
        this.handleError('Following error: ', error);
        return of(null);
      })
    ).subscribe((): void => {
      this.followingIds.push(followedPerson.id);
      this.errorMessage = null;
    });
  }

  unfollowPerson(followedPerson: IProfile): void {
    const { id } = followedPerson;
    this.profileService.unfollowPerson(followedPerson).pipe(
      catchError((error): Observable<null> => {
        this.handleError('Unfollowing error: ', error);
        return of(null);
      })
    ).subscribe((): void => {
      this.profileService.updateFollowingList(followedPerson, 'unfollow');
      this.followingIds = this.followingIds.filter((followingId: number): boolean => followingId !== id);
      this.errorMessage = null;
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
  }
}
