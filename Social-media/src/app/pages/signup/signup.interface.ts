export interface ISignupPayload {
  firstName: string;
  lastName: string;
  password: string;
  description: string;
  hobbies: string[];
  profilePhoto: File | null;
}
