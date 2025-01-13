import {Component, inject, Input} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, Observable} from 'rxjs';

import {Profile} from '../../data/interfaces/profile.interface';
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

  @Input() profile!: Profile;
  @Input() myProfile$!: Observable<Profile | null>;
  @Input() followingIds!: number[];

  errorMessage: string | null = null;


  followPerson(followedPerson: Profile): void {
    this.profileService.followPerson(followedPerson).pipe(
      catchError((error) => {
        this.handleError('Following error: ', error);
        throw error;
      })
    ).subscribe((): void => {
      this.followingIds.push(followedPerson.id);
      this.errorMessage = null;
    });
  }

  unfollowPerson(followedPerson: Profile): void {
    const {id} = followedPerson;
    this.profileService.unfollowPerson(followedPerson).pipe(
      catchError((error) => {
        this.handleError('Unfollowing error: ', error);
        throw error;
      })
    ).subscribe(() => {
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
