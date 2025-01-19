import { Injectable } from '@nestjs/common';

import { Socket, Server } from 'socket.io';


@Injectable()
export class SocketService {
    private server: Server;

    setServer(server: Server) {
        this.server = server;
    }

    onConnection(socket: Socket) {
        console.log('User connected: ', socket.id);

        socket.on('sendMessage', (messageData) => {
            const { receiverId, message } = messageData;
            this.server.to(receiverId).emit('newMessage', message);
        });

        socket.on('updateMessage', (messageData) => {
            const { receiverId, message } = messageData;
            this.server.to(receiverId).emit('updatedMessage', message);
        });

        socket.on('deleteMessage', (messageData) => {
            const { receiverId, idMsg } = messageData;
            this.server.to(receiverId).emit('deleteMessage', idMsg);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    }
}
