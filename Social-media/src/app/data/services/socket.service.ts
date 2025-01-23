import { io } from 'socket.io-client';
import { Injectable } from '@angular/core';

import { IMessage } from '../interfaces/message.interface';
import { environment } from '../../../environments/environment'


/**
 * Service for managing real-time communication with Socket.IO.
 * Provides methods to send and receive messages in chat rooms.
 */
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: any;

  constructor() {
    this.socket = io(environment.baseSocketUrl);
  }

  /**
   * Joins a specific chat room.
   * @param roomId - The ID of the chat room to join.
   */
  joinRoom(roomId: number): void {
    this.socket.emit('joinRoom', roomId);
  }

  /**
   * Listens for new messages in the chat room.
   * @param callback - The callback to handle the new message.
   */
  onMessageReceived(callback: (message: IMessage) => void): void {
    this.socket.on('newMessage', callback);
  }

  /**
   * Listens for updated messages in the chat room.
   * @param callback - The callback to handle the updated message.
   */
  onMessageUpdated(callback: (message: IMessage) => void): void {
    this.socket.on('updatedMessage', callback);
  }

  /**
   * Listens for deleted messages in the chat room.
   * @param callback - The callback to handle the deleted message.
   */
  onMessageDeleted(callback: (messageId: number) => void): void {
    this.socket.on('deletedMessage', callback);
  }

  /**
   * Sends a message update to the server.
   * @param roomId - The ID of the chat room.
   * @param message - The message object to be updated.
   */
  emitMessageUpdate(roomId: number, message: IMessage): void {
    this.socket.emit('updateMessage', { roomId, message });
  }

  /**
   * Sends a new message to the chat room.
   * @param roomId - The ID of the chat room.
   * @param message - The message object to be sent.
   */
  emitMessageSend(roomId: number, message: IMessage): void {
    this.socket.emit('sendMessage', { roomId, message });
  }

  /**
   * Sends a request to delete a message in the chat room.
   * @param roomId - The ID of the chat room.
   * @param messageId - The ID of the message to be deleted.
   */
  emitMessageDelete(roomId: number, messageId: number): void {
    this.socket.emit('deleteMessage', { roomId, messageId });
  }
}
