import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import {ISignupPayload, ISignup, ITokenResponse, ILoginPayload} from './auth.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http: HttpClient = inject(HttpClient);
  router: Router = inject(Router)
  cookieService: CookieService = inject(CookieService)
  baseApiUrl: string = 'http://localhost:5001/api/auth/';
  token: string | null = null;
  refreshToken: string | null = null;

  get isAuth() {
    if (!this.token) {
      console.log(this.cookieService)
      this.token = this.cookieService.get('token')
      this.refreshToken = this.cookieService.get('refreshToken')
    }
    return !!this.token
  }

  signup(payload: ISignup): Observable<ITokenResponse> {
    const jsonPayload: ISignupPayload = this.signupJsonPayload(payload);
    if (payload.profilePhoto) {
      return this.processImageAndSignup(payload.profilePhoto, jsonPayload);
    } else {
      return this.sendSignupRequest(jsonPayload);
    }
  }

  signupJsonPayload(payload: ISignup): ISignupPayload {
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
      description: payload.description,
      hobby: payload.hobbies,
    };
  }

  processImageAndSignup(profilePhoto: File, jsonPayload: ISignupPayload): Observable<ITokenResponse> {
    return new Observable<ITokenResponse>((observer) => {
      const reader: FileReader = new FileReader();
      reader.onload = (): void => {
        jsonPayload.image = reader.result;
        this.sendSignupRequest(jsonPayload).subscribe({
          next: (val: ITokenResponse) => {
            this.saveTokens(val);
            observer.next(val);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(profilePhoto);
    });
  }

  sendSignupRequest(jsonPayload: ISignupPayload): Observable<ITokenResponse> {
    return this.http.post<ITokenResponse>(`${this.baseApiUrl}register`, jsonPayload).pipe(
      tap((val: ITokenResponse) => this.saveTokens(val))
    );
  }

  login(payload: {username: string, password: string}): Observable<ITokenResponse> {
    return this.http.post<ITokenResponse>(`${this.baseApiUrl}login`, payload)
      .pipe(tap((val: ITokenResponse): void => {
        this.saveTokens(val)
    }))
  }

  logout(): void {
    this.cookieService.deleteAll()
    this.token = null
    this.refreshToken = null
    this.router.navigate(['/login'])
  }

  saveTokens(res: ITokenResponse): void {
    this.token =  res.access_token
    this.refreshToken = res.refresh_token
    this.cookieService.set('token', this.token)
    this.cookieService.set('refreshToken', this.refreshToken)
  }

  refreshAuthToken(): Observable<ITokenResponse> {
    return this.http.post<ITokenResponse>(`${this.baseApiUrl}token`, {
      refresh_token: this.refreshToken,
    }).pipe(
      tap((res: ITokenResponse): void => {
        this.saveTokens(res)
      }),
      catchError(err => {
        this.logout()
        return throwError(err)
      })
    )
  }
}
