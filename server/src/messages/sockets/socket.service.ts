import { Injectable } from '@nestjs/common';

import { Server, Socket } from 'socket.io';


/**
 * Service for managing WebSocket connections and real-time events using Socket.IO.
 */
@Injectable()
export class SocketService {
    private server: Server;

    /**
     * Sets the Socket.IO server instance.
     *
     * @param server - The Socket.IO server instance.
     */
    setServer(server: Server): void {
        this.server = server;
    }

    /**
     * Handles new socket connections and sets up event listeners.
     *
     * @param socket - The connected socket instance.
     */
    onConnection(socket: Socket): void {
        /**
         * Joins a user to a specific room by their user ID.
         *
         * @event joinRoom
         * @param userId - The ID of the user joining the room.
         */
        socket.on('joinRoom', (userId: string): void => {
            socket.join(userId);
        });

        /**
         * Listens for sending a new message to a specific room.
         * Emits a 'newMessage' event to the room with the message data.
         *
         * @event sendMessage
         * @param messageData - The data of the message to send.
         * @param messageData.roomId - The ID of the room to send the message to.
         * @param messageData.message - The message content.
         */
        socket.on('sendMessage', (messageData): void => {
            const { roomId, message } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('newMessage', message);
            }
        });

        /**
         * Listens for updating a message in a specific room.
         * Emits an 'updatedMessage' event to the room with the updated message data.
         *
         * @event updateMessage
         * @param messageData - The data of the message to update.
         * @param messageData.roomId - The ID of the room containing the message.
         * @param messageData.message - The updated message content.
         */
        socket.on('updateMessage', (messageData): void => {
            const { roomId, message } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('updatedMessage', message);
            }
        });

        /**
         * Listens for deleting a message in a specific room.
         * Emits a 'deletedMessage' event to the room with the deleted message ID.
         *
         * @event deleteMessage
         * @param messageData - The data of the message to delete.
         * @param messageData.roomId - The ID of the room containing the message.
         * @param messageData.messageId - The ID of the message to delete.
         */
        socket.on('deleteMessage', (messageData): void => {
            const { roomId, messageId } = messageData;
            if (socket.rooms.has(roomId)) {
                this.server.to(roomId).emit('deletedMessage', messageId);
            }
        });
    }
}
