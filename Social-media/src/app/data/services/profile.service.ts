import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {catchError, map, Observable, of, tap} from 'rxjs';

import {Profile} from '../interfaces/profile.interface';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  http: HttpClient = inject(HttpClient)
  baseApiUrl: string = 'http://localhost:5001/api/'
  myProfile: WritableSignal<Profile | null> = signal<Profile | null>(null)

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons`)
  }

  searchProfiles(person: string): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/search`, {
      params: { person },
    });
  }

  getPerson(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseApiUrl}persons/${id}`)
  }

  getMyProfile(): Observable<Profile | null> {
    return this.http.get<Profile>(`${this.baseApiUrl}persons/me`).pipe(
      tap({
        next: (res) => {
          this.myProfile.set(res);
        },
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  getFollowing(userId: string): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/${userId}/following/`);
  }

  getFollowingId(userId: string): Observable<number[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}persons/${userId}/following/`).pipe(
      map((profiles) => profiles.map(profile => profile.id)),
    );
  }
}
