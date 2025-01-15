import {Component, inject} from '@angular/core';
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, Observable, of, switchMap} from 'rxjs';

import { SubscriberCardComponent } from './following-card/following-card.component';
import { ProfileService } from '../../data/services/profile.service';
import { IProfile } from '../../data/interfaces/profile.interface';
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

  profile: IProfile | null = null;
  following$: Observable<IProfile[]> = this.profileService.following$;

  menuItems: {label: string, icon: string, link: string}[] = [
    {label: 'Home', icon: 'home', link: ''},
    {label: 'My Profile', icon: 'profile', link: 'profile'},
    {label: 'Chats', icon: 'chat', link: 'chats'},
    {label: 'Search', icon: 'search', link: 'search'},
    {label: 'Logout', icon: 'logout', link: ''},
  ]

  ngOnInit(): void {
    this.profileService.getMyProfile().pipe(
      switchMap((profile: IProfile | null) => {
        if (profile) {
          this.profile = profile;
          return this.profileService.getFollowing(String(profile.id));
        } else {
          return of([]);
        }
      }),
      catchError((error) => {
        console.error('Sidebar data error: ', error);
        return of([]);
      })
    ).subscribe({});
  }

  onLogout(): void {
    this.authService.logout();
  }
}
