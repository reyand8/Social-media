import { Component, Input } from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import { Observable } from 'rxjs';

import {Profile} from '../../data/interfaces/profile.interface';
import {ImgUrlPipe} from '../../helpers/pipes/img-url.pipe';


@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  standalone: true,
  imports: [
    ImgUrlPipe,
    AsyncPipe,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() profile!: Profile;
  @Input() myProfile$!: Observable<Profile | null>;
  @Input() followingIds!: number[];
}
