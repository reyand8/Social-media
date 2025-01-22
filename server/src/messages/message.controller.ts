import {
    Controller, Get, Post, Body,
    Param, Delete, Request, UseGuards, BadRequestException
} from '@nestjs/common';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/createMessage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import {
    validateCreateMessageDto,
    validateDeleteMessageDto,
    validateEditMessageDto
} from '../utils/validation.utils';
import { Message } from '@prisma/client';
import { IChatPerson } from "./message.interface";



/**
 * Controller to handle messaging-related endpoints.
 * Includes functionality for retrieving messages, user chats,
 * creating, editing, and deleting messages.
 */
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    /**
     * Retrieves messages exchanged between the authenticated user and a specific receiver.
     *
     * @param {string} receiver - The ID of the receiver.
     * @param {any} req - The request object containing authenticated user data.
     * @returns {Promise<Message[]>} List of messages.
     * @throws {BadRequestException} If the receiver ID is invalid.
     */
    @Get('messenger/:receiverId')
    @UseGuards(JwtAuthGuard)
    async getMessages(@Param('receiverId') receiver: string,
                      @Request() req: any): Promise<Message[]> {
        const receiverId: number = +receiver;
        if (isNaN(receiverId)) {
            throw new BadRequestException('Invalid receiverId');
        }
        return this.messageService.getMessages(req.user.sub, receiverId);
    }

    /**
     * Retrieves the list of chats associated with the authenticated user.
     *
     * @param {any} req - The request object containing authenticated user data.
     * @returns {Promise<IChatPerson[]>} List of chat persons.
     */
    @Get('chats/')
    @UseGuards(JwtAuthGuard)
    async getUserChats(@Request() req: any): Promise<IChatPerson[]> {
        return this.messageService.getChats(+req.user.sub);
    }

    /**
     * Creates a new message sent by the authenticated user.
     *
     * @param {CreateMessageDto} createMessageDto - DTO containing message details.
     * @param {any} req - The request object containing authenticated user data.
     * @returns {Promise<Message>} The created message.
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req: any): Promise<Message> {
        const { receiverId, text } = createMessageDto;
        validateCreateMessageDto(createMessageDto);
        return this.messageService.createMessage(
            +req.user.sub,
            receiverId,
            text,
        );
    }

    /**
     * Edits an existing message if the authenticated user has permission.
     *
     * @param {EditMessageDto} editMessageDto - DTO containing the message ID and new text.
     * @param {any} req - The request object containing authenticated user data.
     * @returns {Promise<Message>} The updated message.
     */
    @Post('edit/')
    @UseGuards(JwtAuthGuard)
    async editMessage(@Body() editMessageDto: EditMessageDto, @Request() req: any ): Promise<Message> {
        const { editMessageId, text } = editMessageDto;
        validateEditMessageDto(editMessageDto);
        return this.messageService.updateMessage(
            +editMessageId,
            text,
            req.user.id);
    }

    /**
     * Deletes a message if the authenticated user has permission.
     *
     * @param {DeleteMessageDto} deleteMessageDto - DTO containing the message ID to be deleted.
     * @param {any} req - The request object containing authenticated user data.
     * @returns {Promise<Message>} The deleted message.
     */
    @Delete('delete/')
    @UseGuards(JwtAuthGuard)
    async deleteMessage(@Body() deleteMessageDto: DeleteMessageDto, @Request() req: any): Promise<Message> {
        validateDeleteMessageDto(deleteMessageDto);
        return this.messageService.deleteMessage(+deleteMessageDto.id, req.user.id);
    }
}
