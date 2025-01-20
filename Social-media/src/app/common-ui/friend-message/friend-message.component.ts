import {Component, Input} from '@angular/core';

import {formatDate} from '../../helpers/utils/formatDate';
import {IMessage} from '../../data/interfaces/message.interface';


@Component({
  selector: 'app-friend-message',
  standalone: true,
  imports: [],
  templateUrl: './friend-message.component.html',
  styleUrl: './friend-message.component.scss'
})
export class FriendMessageComponent {
  @Input() message!: IMessage;
  formatDate = formatDate;
}
