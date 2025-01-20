import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

import {ImgUrlPipe} from '../../helpers/pipes/img-url.pipe';
import {IChatPerson} from '../../data/interfaces/message.interface';
import {IProfile} from '../../data/interfaces/profile.interface';


@Component({
  selector: 'app-friend-info',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    ImgUrlPipe
  ],
  templateUrl: './friend-info.component.html',
  styleUrl: './friend-info.component.scss'
})
export class FriendInfoComponent {
  @Input() receiver?: IChatPerson | IProfile;
  @Output() closeFriendInfoEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  closeModal(): void {
    this.closeFriendInfoEvent.emit();
  }
}
