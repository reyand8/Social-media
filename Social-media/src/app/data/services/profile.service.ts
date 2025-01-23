import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { IUpdateProfile, IProfile } from '../interfaces/profile.interface';
import { processImage } from '../../helpers/utils/processImage';
import { environment } from '../../../environments/environment';


/**
 * Service for managing user profiles, including fetching,
 * updating, following/unfollowing users, and handling profile images.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http: HttpClient = inject(HttpClient)
  baseApiUrl: string = environment.baseApiUrl;

  private followingSubject: BehaviorSubject<IProfile[]> = new BehaviorSubject<IProfile[]>([]);
  public following$: Observable<IProfile[]> = this.followingSubject.asObservable();

  /**
   * Fetches a list of profiles.
   */
  getProfiles(): Observable<IProfile[] | { error: string }> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons`)
  }

  /**
   * Fetches the current user's profile.
   */
  getMyProfile(): Observable<IProfile | null> {
    return this.http.get<IProfile>(`${this.baseApiUrl}persons/me`)
  }

  /**
   * Fetches a specific user's profile by ID.
   */
  getPerson(id: string): Observable<IProfile> {
    return this.http.get<IProfile>(`${this.baseApiUrl}persons/${id}/find`)
  }

  /**
   * Removes the current user's profile.
   */
  removeMyProfile(): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}persons/me`)
  }

  /**
   * Searches profiles by name.
   */
  searchProfiles(person: string): Observable<IProfile[]> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons/search`, {
      params: { person },
    });
  }

  /**
   * Follows a user.
   */
  followPerson(followed: IProfile): Observable<null> {
    return this.http.post<any>(`${this.baseApiUrl}persons/${followed.id}/follow`, {}).pipe(
      tap((): void => {
        this.updateFollowingList(followed, 'follow');
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * Unfollows a user.
   */
  unfollowPerson(followed: IProfile): Observable<null> {
    const { id} = followed
    return this.http.post<any>(`${this.baseApiUrl}persons/${id}/unfollow`, {}).pipe(
      tap((): void => {
        this.updateFollowingList(followed, 'unfollow');
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * Fetches a user's following profiles.
   */
  getFollowing(userId: string): Observable<IProfile[]> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      tap((followingProfiles: IProfile[]): void => {
        this.followingSubject.next(followingProfiles);
      }),
      catchError(() => {
        return of([]);
      })
    );
  }

  /**
   * Fetches a list of following IDs for a user.
   */
  getFollowingId(userId: string): Observable<number[]> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      map((profiles: IProfile[]) => profiles.map(profile => profile.id)),
    );
  }

  /**
   * Updates the list of profiles the current user is following.
   */
  updateFollowingList(followedPerson: IProfile, action: 'follow' | 'unfollow') {
    const currentFollowing: IProfile[] = this.followingSubject.getValue();
    let updatedFollowing: IProfile[];
    if (action === 'follow') {
      updatedFollowing = [...currentFollowing, followedPerson as IProfile];
    } else {
      updatedFollowing = currentFollowing.filter((profile: IProfile): boolean =>
        profile.id !== followedPerson.id);
    }
    this.followingSubject.next(updatedFollowing);
  }

  /**
   * Updates the user's profile.
   */
  updateProfile(data: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    if (data.image && typeof data.image !== 'string') {
      return this.processImageAndUpdateProfile(data.image, data);
    } else {
      return this.sendUpdateRequest(data);
    }
  }

  /**
   * Processes the image before updating the profile.
   */
  processImageAndUpdateProfile(profilePhoto: File, jsonPayload: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    return processImage(profilePhoto, jsonPayload, (payload) => this.sendUpdateRequest(payload));
  }

  /**
   * Sends the profile update request.
   */
  sendUpdateRequest(jsonPayload: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    return this.http.patch<IUpdateProfile>(`${this.baseApiUrl}persons/me`, jsonPayload);
  }
}
