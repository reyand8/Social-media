import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IChatPerson, IMessage } from '../interfaces/message.interface';
import { environment } from '../../../environments/environment';


/**
 * Service for handling message operations, such as fetching messages,
 * creating, editing, and deleting messages.
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseApiUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves messages for a specific chat with a user.
   */
  getMessages(receiverId: string): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(`${this.baseApiUrl}messages/messenger/${receiverId}`);
  }

  /**
   * Fetches the list of chats the current user has.
   */
  getUserChats(): Observable<IChatPerson[]> {
    return this.http.get<IChatPerson[]>(`${this.baseApiUrl}messages/chats`);
  }

  /**
   * Sends a new message to a specified receiver.
   */
  createMessage(data: { receiverId: number; text: string }): Observable<any> {
    return this.http.post(`${this.baseApiUrl}messages/`, data);
  }

  /**
   * Edits an existing message by its ID.
   */
  editMessage(data: { editMessageId: number, text: string }): Observable<any> {
    return this.http.post(`${this.baseApiUrl}messages/edit/`, data);
  }

  /**
   * Deletes a specific message by its ID.
   */
  deleteMessage(data: { id: number }): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}messages/delete/`, {
      body: data
    });
  }
}
