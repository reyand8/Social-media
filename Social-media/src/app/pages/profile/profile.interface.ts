import {FormArray, FormControl} from "@angular/forms";

export interface IMyProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  description: FormControl<string>;
  hobby: FormArray<FormControl<string>>;
  image: FormControl<string | File | null>;
}

export interface IMyProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  description: string;
  hobby: string[];
  image: any;
}
