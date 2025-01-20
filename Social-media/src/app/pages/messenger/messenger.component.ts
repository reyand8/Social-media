import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';

import { MyMessageComponent } from '../../common-ui/my-message/my-message.component';
import { FriendMessageComponent } from '../../common-ui/friend-message/friend-message.component';
import { FriendInfoComponent } from '../../common-ui/friend-info/friend-info.component';
import { ProfileService } from '../../data/services/profile.service';
import { MessageService } from '../../data/services/message.service';
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
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {
  profileService: ProfileService = inject(ProfileService);
  messageService: MessageService = inject(MessageService);

  openFriendInfo: WritableSignal<boolean> = signal<boolean>(false);
  newMessage: WritableSignal<string> = signal('');
  editMessageId: WritableSignal<number | null> = signal(null);

  messages: IMessage[] = [];
  receiver!: IProfile;
  receiverId: string = '';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.receiverId = this.route.snapshot.paramMap.get('receiverId')!;

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
    this.profileService.getPerson(this.receiverId).subscribe({
      next: (receiver: IProfile): void => {
        this.receiver = receiver;
      },
      error: (err): void => {
        console.error('Receiver data error:', err);
      }
    });
  }

  sendMessage(): void {
    const editMessageId: number | null = this.editMessageId();
    const text: string = this.newMessage();
    if (text.trim() === '') {
      return;
    }
    if (editMessageId) {
      this.messageService.editMessage({editMessageId, text}).subscribe({
        next: (newMessage: IMessage): void => {
          this.messages = this.messages.map(message =>
            message.id === editMessageId ? newMessage : message
          );
          this.newMessage.set('');
        },
        error: (err): void => {
          console.error('Error sending message:', err);
        },
      });
    } else {
      const receiverId: number = Number(this.route.snapshot.paramMap.get('receiverId'));
      this.messageService.createMessage({receiverId, text}).subscribe({
        next: (newMessage: IMessage): void => {
          this.messages = [...this.messages, newMessage];
          this.newMessage.set('');
        },
        error: (err): void => {
          console.error('Error sending message:', err);
        },
      });
    }
  }

  editMessage(message: { id: number, text: string }): void {
    this.newMessage.set(message.text);
    this.editMessageId.set(message.id);
  }

  deleteMessage(messageId: number): void {
    this.messageService.deleteMessage({id: messageId}).subscribe({
      next: (): void => {
        this.messages = this.messages.filter((message: IMessage): boolean => message.id !== messageId)
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
