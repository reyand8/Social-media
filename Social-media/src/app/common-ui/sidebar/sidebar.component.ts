import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

import { SubscriberCardComponent } from './following-card/following-card.component';
import { ProfileService } from '../../data/services/profile.service';
import { IProfile } from '../../data/interfaces/profile.interface';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
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
  private destroy$: Subject<void> = new Subject<void>();


  menuItems: {label: string, icon: string, link?: string, action?: () => void}[] = [
    {label: 'Home', icon: 'home', link: '/'},
    {label: 'My Profile', icon: 'profile', link: 'profile'},
    {label: 'Chats', icon: 'chat', link: 'chats'},
    {label: 'Search', icon: 'search', link: 'search'},
    {label: 'Logout', icon: 'logout', action: () => this.onLogout()},
  ]

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getMyProfile().pipe(
      takeUntil(this.destroy$),
      switchMap((profile: IProfile | null) => {
        if (profile) {
          this.profile = profile;
          this.storeUserData(profile);
          return this.loadFollowing(profile.id);
        }
        return of([]);
      }),
      catchError((error) => {
        console.error('Error loading profile: ', error);
        return of([]);
      })
    ).subscribe();
  }

  private storeUserData(profile: IProfile): void {
    const userData: { userId: number; username: string } =
      { userId: profile.id, username: profile.username };
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  private loadFollowing(userId: number): Observable<IProfile[]> {
    return this.profileService.getFollowing(String(userId)).pipe(
      catchError((error) => {
        console.error('Error loading following: ', error);
        return of([]);
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
