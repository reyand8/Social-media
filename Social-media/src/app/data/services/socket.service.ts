import { io } from 'socket.io-client';
import { Injectable } from '@angular/core';

import {IMessage} from '../interfaces/message.interface';


@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:3001');
  }

  joinRoom(roomId: number): void {
    this.socket.emit('joinRoom', roomId);
  }

  onMessageReceived(callback: (message: IMessage) => void): void {
    this.socket.on('newMessage', callback);
  }

  onMessageUpdated(callback: (message: IMessage) => void): void {
    this.socket.on('updatedMessage', callback);
  }

  onMessageDeleted(callback: (messageId: number) => void): void {
    this.socket.on('deletedMessage', callback);
  }

  emitMessageUpdate(roomId: number, message: IMessage): void {
    this.socket.emit('updateMessage', { roomId, message });
  }

  emitMessageSend(roomId: number, message: IMessage): void {
    this.socket.emit('sendMessage', { roomId, message });
  }

  emitMessageDelete(roomId: number, messageId: number): void {
    this.socket.emit('deleteMessage', { roomId, messageId });
  }
}
