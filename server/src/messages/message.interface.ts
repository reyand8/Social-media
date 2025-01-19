export interface IMessage {
    id: number;
    text: string;
    senderId: number;
    receiverId: number;
    createdAt: string;
    updatedAt: string;
    sender: IUser;
    receiver: IUser;
}

export interface IUser {
    firstName: string;
    lastName: string;
    username: string;
}

export interface IChatPerson {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    description: string;
    hobby: string[];
    image: string;
}