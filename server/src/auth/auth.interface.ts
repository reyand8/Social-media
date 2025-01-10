export interface ITokens {
    access_token: string;
    refresh_token: string
}

export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    description: string;
    hobby: string[];
    image: string;
    createdAt: Date;
    password: string;
}

export class ICreatePersonDto {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    description: string;
    hobby: string[];
    image: string;
}
