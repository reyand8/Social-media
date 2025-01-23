import {FormArray, FormControl} from "@angular/forms";

export interface ISignupPayload {
  firstName: string;
  lastName: string;
  password: string;
  description: string;
  hobbies: string[];
  profilePhoto: File | null;
}

export interface ISignupForm {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  password: FormControl<string | null>;
  description: FormControl<string | null>;
  hobbies: FormArray<FormControl<string>>;
  profilePhoto: FormControl<File | null>;
}
