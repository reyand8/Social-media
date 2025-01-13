import {Component, inject} from '@angular/core';
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Observable, switchMap} from 'rxjs';

import { SubscriberCardComponent } from './following-card/following-card.component';
import { ProfileService } from '../../data/services/profile.service';
import { Profile } from '../../data/interfaces/profile.interface';
import {ImgUrlPipe} from '../../helpers/pipes/img-url.pipe';
import { AuthService } from '../../auth/auth.service';
import { SvgComponent } from '../svg/svg.component';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SvgComponent, AsyncPipe, SubscriberCardComponent,
    JsonPipe, ImgUrlPipe, RouterLink, NgForOf, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  profileService: ProfileService = inject(ProfileService)
  authService: AuthService = inject(AuthService)
  profile: any;
  following: any;

  myProfile$: Observable<Profile | null> = this.profileService.getMyProfile();
  following$: Observable<Profile[]> = this.myProfile$.pipe(
    switchMap((profile: Profile | null) =>
      profile ? this.profileService.getFollowing(String(profile.id)) : []
    )
  );

  menuItems: {label: string, icon: string, link: string}[] = [
    {
      label: 'Home',
      icon: 'home',
      link: '',
    },
    {
      label: 'My Profile',
      icon: 'profile',
      link: 'profile',
    },
    {
      label: 'Chats',
      icon: 'chat',
      link: 'chats',
    },
    {
      label: 'Search',
      icon: 'search',
      link: 'search',
    },
    {
      label: 'Logout',
      icon: 'logout',
      link: '',
    }
  ]

  constructor() {
    this.myProfile$.subscribe((profile: Profile | null): void => {
      this.profile = profile;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
