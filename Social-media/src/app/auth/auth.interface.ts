export interface ITokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ISignup {
  firstName: string;
  lastName: string;
  password: string;
  description: string;
  hobbies: string[];
  profilePhoto: File | null;
}

export interface ISignupPayload {
  firstName: string;
  lastName: string;
  password: string;
  description: string;
  hobby: string[];
  image?: string | ArrayBuffer | null;
}

export interface ILoginPayload {
  username: string;
  password: string;
}
