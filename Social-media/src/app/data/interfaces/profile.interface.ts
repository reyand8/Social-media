export interface Profile {
  id: number | string,
  username: string,
  image: string | null,
  firstName: string,
  lastName: string,
  description: string,
  hobby: string[],
}
