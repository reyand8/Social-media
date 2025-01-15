import { Component, Input } from '@angular/core';

import { ImgUrlPipe } from '../../../helpers/pipes/img-url.pipe';
import { IProfile } from '../../../data/interfaces/profile.interface';


@Component({
  selector: 'app-following-card',
  standalone: true,
  imports: [ImgUrlPipe],
  templateUrl: './following-card.component.html',
  styleUrl: './following-card.component.scss'
})
export class SubscriberCardComponent {
  @Input() profile!: IProfile
}
