import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImgUrlPipe } from '../../../helpers/pipes/img-url.pipe';
import { IProfile } from '../../../data/interfaces/profile.interface';


@Component({
  selector: 'app-following-card',
  standalone: true,
  imports: [ImgUrlPipe, RouterLink],
  templateUrl: './following-card.component.html',
  styleUrl: './following-card.component.scss'
})
export class SubscriberCardComponent {
  @Input() profile!: IProfile
}
