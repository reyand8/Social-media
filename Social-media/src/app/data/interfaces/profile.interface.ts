export interface Profile {
  id: number,
  username: string,
  image: string | null,
  firstName: string,
  lastName: string,
  description: string,
  hobby: string[],
}
