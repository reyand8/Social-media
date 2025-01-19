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


@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

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

    @Get('chats/')
    @UseGuards(JwtAuthGuard)
    async getUserChats(@Request() req: any): Promise<IChatPerson[]> {
        return this.messageService.getChats(+req.user.sub);
    }

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

    @Delete('delete/')
    @UseGuards(JwtAuthGuard)
    async deleteMessage(@Body() deleteMessageDto: DeleteMessageDto, @Request() req: any): Promise<Message> {
        validateDeleteMessageDto(deleteMessageDto);
        return this.messageService.deleteMessage(+deleteMessageDto.id, req.user.id);
    }
}
