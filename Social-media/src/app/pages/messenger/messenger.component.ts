import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';

import { MyMessageComponent } from '../../common-ui/my-message/my-message.component';
import { FriendMessageComponent } from '../../common-ui/friend-message/friend-message.component';
import { FriendInfoComponent } from '../../common-ui/friend-info/friend-info.component';
import { ProfileService } from '../../data/services/profile.service';
import { MessageService } from '../../data/services/message.service';
import { SocketService } from '../../data/services/socket.service';
import { IProfile } from '../../data/interfaces/profile.interface';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import { IMessage } from '../../data/interfaces/message.interface';


@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    MyMessageComponent, FriendMessageComponent, FriendInfoComponent,
    NgIf, NgForOf, ImgUrlPipe, FormsModule],
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent {
  socketService: SocketService = inject(SocketService);
  profileService: ProfileService = inject(ProfileService);
  messageService: MessageService = inject(MessageService);

  openFriendInfo: WritableSignal<boolean> = signal<boolean>(false);
  newMessage: WritableSignal<string> = signal('');
  editMessageId: WritableSignal<number | null> = signal(null);

  messages: IMessage[] = [];
  receiver!: IProfile;
  receiverId: string = '';
  userId: number | null = null;
  roomId: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeReceiverId();
    this.initializeUserData();
    this.loadReceiverProfile();
    this.loadMessages();
    this.listenForSocketEvents();
  }


  initializeReceiverId(): void {
    this.receiverId = this.route.snapshot.paramMap.get('receiverId')!;
  }

  initializeUserData(): void {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = user.userId;
    if (user && this.userId !== null && this.receiverId) {
      this.roomId = (+this.receiverId * 4) + (user.userId * 4);
    } else {
      console.error('User ID not found in localStorage');
    }
  }


  loadReceiverProfile(): void {
    this.profileService.getPerson(this.receiverId).subscribe({
      next: (receiver: IProfile): void => {
        this.receiver = receiver;
      },
      error: (err): void => {
        console.error('Receiver data error:', err);
      }
    });
  }


  loadMessages(): void {
    if (this.receiverId) {
      this.messageService.getMessages(this.receiverId).subscribe({
        next: (messages: IMessage[]): void => {
          this.messages = messages;
        },
        error: (err): void => {
          console.error('Messenger error:', err);
        }
      });
    }
  }


  listenForSocketEvents(): void {
    if (this.roomId !== null) {
      this.socketService.joinRoom(this.roomId);
    }

    this.socketService.onMessageReceived((message: IMessage): void => {
      if (message.receiverId === this.userId) {
        this.messages = [...this.messages, message];
      }
    });

    this.socketService.onMessageUpdated((updatedMessage: IMessage): void => {
      this.messages = this.messages.map(message =>
        message.id === updatedMessage.id ? updatedMessage : message
      );
    });

    this.socketService.onMessageDeleted((messageId: number): void => {
      this.messages = this.messages.filter(message => message.id !== messageId);
    });
  }

  // Отправка сообщения
  sendMessage(): void {
    const editMessageId: number | null = this.editMessageId();
    const text: string = this.newMessage();
    if (text.trim() === '') {
      return;
    }
    if (editMessageId) {
      this.editMessage(editMessageId, text);
    } else {
      this.createMessage(text);
    }
  }

  private editMessage(editMessageId: number, text: string): void {
    this.messageService.editMessage({ editMessageId, text }).subscribe({
      next: (newMessage: IMessage): void => {
        if (this.roomId !== null) {
          this.socketService.emitMessageUpdate(this.roomId, newMessage);
        }
        this.messages = this.messages.map(message =>
          message.id === editMessageId ? newMessage : message
        );
        this.newMessage.set('');
      },
      error: (err): void => {
        console.error('Error sending message:', err);
      },
    });
  }

  private createMessage(text: string): void {
    const receiverId: number = Number(this.route.snapshot.paramMap.get('receiverId'));
    this.messageService.createMessage({ receiverId, text }).subscribe({
      next: (newMessage: IMessage): void => {
        if (this.roomId !== null) {
          this.socketService.emitMessageSend(this.roomId, newMessage);
        }
        this.messages = [...this.messages, newMessage];
        this.newMessage.set('');
      },
      error: (err): void => {
        console.error('Error sending message:', err);
      },
    });
  }

  editMessageContent(message: { id: number, text: string }): void {
    this.newMessage.set(message.text);
    this.editMessageId.set(message.id);
  }

  deleteMessage(messageId: number): void {
    this.messageService.deleteMessage({ id: messageId }).subscribe({
      next: (): void => {
        if (this.roomId !== null) {
          this.socketService.emitMessageDelete(this.roomId, messageId);
        }
        this.messages = this.messages.filter((message: IMessage): boolean => message.id !== messageId);
      },
      error: (err): void => {
        console.error('Error deleting message:', err);
      },
    });
  }

  onOpenFriendInfo(): void {
    this.openFriendInfo.set(true);
  }

  onCloseFriendInfo(): void {
    this.openFriendInfo.set(false);
  }
}
