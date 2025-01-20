import {Component, EventEmitter, Input, Output} from '@angular/core';

import {formatDate} from '../../helpers/utils/formatDate';
import {IMessage} from '../../data/interfaces/message.interface';


@Component({
  selector: 'app-my-message',
  standalone: true,
  imports: [],
  templateUrl: './my-message.component.html',
  styleUrl: './my-message.component.scss'
})
export class MyMessageComponent {
  @Input() message!: IMessage;
  @Output() clickDeleteMessage: EventEmitter<number> = new EventEmitter<number>();
  @Output() clickEditMessage: EventEmitter<{ id: number, text: string }> =
    new EventEmitter<{ id: number, text: string }>();

  onDelete(): void {
    this.clickDeleteMessage.emit(this.message.id);
  }

  onEdit(): void {
    this.clickEditMessage.emit({ id: this.message.id, text: this.message.text });
  }

  formatDate = formatDate;
}
