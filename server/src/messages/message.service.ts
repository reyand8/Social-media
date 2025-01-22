import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { Message, Prisma } from '@prisma/client';
import { IChatPerson } from './message.interface';


/**
 * Service for managing messages and chat interactions.
 * Handles database operations using Prisma.
 */
@Injectable()
export class MessageService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Retrieves messages between two users, sorted by creation date.
     *
     * @param senderId - ID of the sender.
     * @param receiverId - ID of the receiver.
     * @returns A list of messages between the sender and receiver.
     */
    async getMessages(senderId: number, receiverId: number): Promise<Message[]> {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
                receiver: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        } as Prisma.MessageFindManyArgs);
    }

    /**
     * Retrieves the chat participants for a specific user.
     *
     * @param userId - ID of the user.
     * @returns A list of chat participants with their details.
     */
    async getChats(userId: number): Promise<IChatPerson[]> {
        const conversations = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            include: {
                sender: true,
                receiver: true,
            },
        });

        const participants: Set<number> = new Set<number>();
        const result: IChatPerson[] = [];

        for (const conversation of conversations) {
            const otherPerson = conversation.senderId !== userId ? conversation.sender : conversation.receiver;
            if (!participants.has(otherPerson.id)) {
                participants.add(otherPerson.id);
                result.push({
                    id: otherPerson.id,
                    firstName: otherPerson.firstName,
                    lastName: otherPerson.lastName,
                    username: otherPerson.username,
                    description: otherPerson.description,
                    hobby: otherPerson.hobby,
                    image: otherPerson.image,
                });
            }
        }
        return result;
    }

    /**
     * Creates a new message between two users.
     *
     * @param senderId - ID of the sender.
     * @param receiverId - ID of the receiver.
     * @param text - The message text.
     * @returns The created message.
     */
    async createMessage(senderId: number, receiverId: number, text: string): Promise<Message> {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                text,
            },
        });
    }

    /**
     * Deletes a message by its ID if the user is authorized.
     *
     * @param id - ID of the message to delete.
     * @param userId - ID of the user attempting to delete the message.
     * @returns The deleted message.
     * @throws Error if the message is not found or the user is not authorized.
     */
    async deleteMessage(id: number, userId: number): Promise<Message> {
        const message = await this.prisma.message.findFirst({
            where: {
                id: id,
                senderId: userId,
            },
        });
        if (!message) {
            throw new Error('Message not found or user is not authorized to delete this message');
        }
        return this.prisma.message.delete({
            where: { id },
        });
    }


    /**
     * Updates the text of a message if the user is authorized.
     *
     * @param editMessageId - ID of the message to edit.
     * @param text - New text for the message.
     * @param userId - ID of the user attempting to edit the message.
     * @returns The updated message.
     * @throws Error if the message is not found or the user is not authorized.
     */
    async updateMessage(editMessageId: number, text: string, userId: number): Promise<Message> {
        const message = await this.prisma.message.findFirst({
            where: {
                id: editMessageId,
                senderId: userId,
            },
        });
        if (!message) {
            throw new Error('Message not found or user is not authorized');
        }
        return this.prisma.message.update({
            where: { id: editMessageId },
            data: { text },
        });
    }
}
