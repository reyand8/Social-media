import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { Message, Prisma } from '@prisma/client';
import { IChatPerson } from './message.interface';


@Injectable()
export class MessageService {
    constructor(private readonly prisma: PrismaService) {}

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

    async createMessage(senderId: number, receiverId: number, text: string): Promise<Message> {
        return this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                text,
            },
        });
    }

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
