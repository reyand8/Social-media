import { Injectable } from '@nestjs/common';

import { Server, Socket } from 'socket.io';


@Injectable()
export class SocketService {
    private server: Server;

    setServer(server: Server): void {
        this.server = server;
    }

    onConnection(socket: Socket): void {
        socket.on('joinRoom', (userId: string): void => {
            socket.join(userId);
        });

        socket.on('sendMessage', (messageData): void => {
            const { roomId, message } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('newMessage', message);
            }
        });

        socket.on('updateMessage', (messageData): void => {
            const { roomId, message } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('updatedMessage', message);
            }
        });

        socket.on('deleteMessage', (messageData): void => {
            const { roomId, messageId } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('deletedMessage', messageId);
            }
        });
    }
}
