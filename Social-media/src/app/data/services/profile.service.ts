import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { IUpdateProfile, IProfile } from '../interfaces/profile.interface';
import { processImage } from '../../helpers/utils/processImage';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http: HttpClient = inject(HttpClient)
  baseApiUrl: string = 'http://localhost:5001/api/'

  private followingSubject: BehaviorSubject<IProfile[]> = new BehaviorSubject<IProfile[]>([]);
  public following$: Observable<IProfile[]> = this.followingSubject.asObservable();


  getProfiles(): Observable<IProfile[] | { error: string }> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons`)
  }

  getMyProfile(): Observable<IProfile | null> {
    return this.http.get<IProfile>(`${this.baseApiUrl}persons/me`)
  }

  getPerson(id: string): Observable<IProfile> {
    return this.http.get<IProfile>(`${this.baseApiUrl}persons/${id}`)
  }

  searchProfiles(person: string): Observable<IProfile[]> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons/search`, {
      params: { person },
    });
  }

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

  getFollowingId(userId: string): Observable<number[]> {
    return this.http.get<IProfile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      map((profiles: IProfile[]) => profiles.map(profile => profile.id)),
    );
  }

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

  updateProfile(data: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    if (data.image) {
      return this.processImageAndUpdateProfile(data.image, data);
    } else {
      return this.sendUpdateRequest(data);
    }
  }

  processImageAndUpdateProfile(profilePhoto: File, jsonPayload: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    return processImage(profilePhoto, jsonPayload, (payload) => this.sendUpdateRequest(payload));
  }

  sendUpdateRequest(jsonPayload: Partial<IUpdateProfile>): Observable<IUpdateProfile> {
    return this.http.patch<IUpdateProfile>(`${this.baseApiUrl}persons/me`, jsonPayload);
  }
}
