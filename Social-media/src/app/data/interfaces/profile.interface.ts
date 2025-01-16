export interface IProfile {
  id: number,
  username: string,
  image: string | null,
  firstName: string,
  lastName: string,
  description: string,
  hobby: string[],
}

export interface IUpdateProfile {
  id: number,
  username: string,
  image: File | string | null,
  firstName: string,
  lastName: string,
  description: string,
  hobby: string[],
}
