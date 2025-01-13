import {FormArray, FormControl} from "@angular/forms";

export interface IMyProfileForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  description: FormControl<string>;
  hobbies: FormArray<FormControl<string>>;
}

export interface IMyProfile {
  firstName: string;
  lastName: string;
  description: string;
  hobby: string[];
}
