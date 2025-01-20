import { Routes } from '@angular/router';

import { canActivateAuth } from './auth/access.guard';
import { LayoutComponent } from './common-ui/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { MessengerComponent } from './pages/messenger/messenger.component';


export const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      {path: '', component: HomeComponent},
      {path: 'search', component: SearchComponent},
      {path: 'profile', component: ProfileComponent},
      {path: 'chats', component: ChatsComponent},
      {path: 'messenger/:receiverId', component: MessengerComponent},
    ],
    canActivate: [canActivateAuth]
  },
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
];
