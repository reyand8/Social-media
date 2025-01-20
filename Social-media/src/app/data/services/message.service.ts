import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IChatPerson, IMessage } from '../interfaces/message.interface';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseApiUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  getMessages(receiverId: string): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(`${this.baseApiUrl}messages/messenger/${receiverId}`);
  }

  getUserChats(): Observable<IChatPerson[]> {
    return this.http.get<IChatPerson[]>(`${this.baseApiUrl}messages/chats`);
  }

  createMessage(data: { receiverId: number; text: string }): Observable<any> {
    return this.http.post(`${this.baseApiUrl}messages/`, data);
  }

  editMessage(data: { editMessageId: number, text: string }): Observable<any> {
    return this.http.post(`${this.baseApiUrl}messages/edit/`, data);
  }

  deleteMessage(data: { id: number }): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}messages/delete/`, {
      body: data
    });
  }
}
