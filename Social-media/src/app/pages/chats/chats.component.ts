import { Component, inject } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';

import { ChatCardComponent } from '../../common-ui/chat-card/chat-card.component';
import { MessageService } from '../../data/services/message.service';
import { IChatPerson } from '../../data/interfaces/message.interface';


@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    ChatCardComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent {
  userChats: IChatPerson[] = [];
  isLoading: boolean = false;

  messageService: MessageService = inject(MessageService);

  constructor() {}

  ngOnInit(): void {
    this.messageService
      .getUserChats()
      .subscribe({
        next: (data: IChatPerson[]): void => {
          this.userChats = data;
        },
        error: (err): void => {
          console.error('Get chats error: ', err);
        }
      });
  }
}
