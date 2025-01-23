import { Component, inject } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';

import { ChatCardComponent } from '../../common-ui/chat-card/chat-card.component';
import { MessageService } from '../../data/services/message.service';
import { IChatPerson } from '../../data/interfaces/message.interface';

/**
 * This component is responsible for displaying a list of user chats. It fetches chat data using the `MessageService`
 * and renders the list of chat conversations in `ChatCardComponent` for each individual chat.
 *
 * Variables:
 * - `userChats`: An array of chat persons that contains data related to the user's chats.
 * - `isLoading`: A boolean flag indicating whether the chat data is being loaded.
 *
 * Methods:
 * - `ngOnInit()`: Fetches the list of chats from the `MessageService` and updates the `userChats` array with the
 *   received data. If an error occurs, it logs the error to the console.
 */
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
