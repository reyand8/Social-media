import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {BehaviorSubject, catchError, map, Observable, of, tap} from 'rxjs';

import {Profile} from '../interfaces/profile.interface';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http: HttpClient = inject(HttpClient)
  baseApiUrl: string = 'http://localhost:5001/api/'

  private followingSubject: BehaviorSubject<Profile[]> = new BehaviorSubject<Profile[]>([]);
  public following$: Observable<Profile[]> = this.followingSubject.asObservable();


  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons`)
  }

  searchProfiles(person: string): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/search`, {
      params: { person },
    });
  }

  followPerson(followed: Profile): Observable<null> {
    return this.http.post<any>(`${this.baseApiUrl}persons/${followed.id}/follow`, {}).pipe(
      tap((): void => {
        this.updateFollowingList(followed, 'follow');
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  unfollowPerson(followed: Profile): Observable<null> {
    const {id} = followed
    return this.http.post<any>(`${this.baseApiUrl}persons/${id}/unfollow`, {}).pipe(
      tap((): void => {
        this.updateFollowingList(followed, 'unfollow');
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  getPerson(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseApiUrl}persons/${id}`)
  }

  getMyProfile(): Observable<Profile | null> {
    return this.http.get<Profile>(`${this.baseApiUrl}persons/me`)
  }

  getFollowing(userId: string): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      tap((followingProfiles: Profile[]): void => {
        this.followingSubject.next(followingProfiles);
      }),
      catchError(() => {
        return of([]);
      })
    );
  }

  getFollowingId(userId: string): Observable<number[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      map((profiles: Profile[]) => profiles.map(profile => profile.id)),
    );
  }

  updateFollowingList(followedPerson: Profile, action: 'follow' | 'unfollow') {
    const currentFollowing: Profile[] = this.followingSubject.getValue();
    let updatedFollowing: Profile[];
    if (action === 'follow') {
      updatedFollowing = [...currentFollowing, followedPerson as Profile];
    } else {
      updatedFollowing = currentFollowing.filter((profile: Profile): boolean => profile.id !== followedPerson.id);
    }
    this.followingSubject.next(updatedFollowing);
  }

  updateProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.patch<Profile>(`${this.baseApiUrl}persons/me`, data);
  }

}
