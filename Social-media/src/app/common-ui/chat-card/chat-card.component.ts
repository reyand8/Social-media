import { Component, Input, signal, WritableSignal } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import { FriendInfoComponent } from '../friend-info/friend-info.component';
import { IChatPerson } from '../../data/interfaces/message.interface';


@Component({
  selector: 'app-chat-card',
  standalone: true,
  imports: [
    AsyncPipe,
    ImgUrlPipe,
    NgForOf,
    NgIf,
    RouterLink,
    FriendInfoComponent
  ],
  templateUrl: './chat-card.component.html',
  styleUrl: './chat-card.component.scss'
})
export class ChatCardComponent {
  @Input() receiver!: IChatPerson;
  openFriendInfo: WritableSignal<boolean> = signal<boolean>(false)

  onOpenFriendInfo(): void {
    this.openFriendInfo.set(true);
  }

  onCloseFriendInfo(): void {
    this.openFriendInfo.set(false);
  }
}
