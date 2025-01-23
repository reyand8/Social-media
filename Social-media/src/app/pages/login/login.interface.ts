import {FormControl} from '@angular/forms';

export interface ILoginPayload {
  username: string;
  password: string;
}

export interface ILoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

