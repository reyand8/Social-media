import {BadRequestException} from '@nestjs/common';

import { CreatePersonDto } from '../auth/dto/createPerson.dto';
import { CreateMessageDto } from '../messages/dto/createMessage.dto';
import {EditMessageDto} from '../messages/dto/editMessage.dto';
import {DeleteMessageDto} from '../messages/dto/deleteMessage.dto';


export function isValidData(createPersonDto: CreatePersonDto): boolean {
    if (!createPersonDto.firstName || !createPersonDto.lastName || !createPersonDto.password) {
        throw new Error('Missing required fields');
    }
    if (createPersonDto.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }
    if (typeof createPersonDto.firstName !== 'string' ||
        typeof createPersonDto.lastName !== 'string' ||
        typeof createPersonDto.password !== 'string' ||
        typeof createPersonDto.description !== 'string') {
        throw new Error('firstName, lastName, password, and description must be strings');
    }
    if (!Array.isArray(createPersonDto.hobby)) {
        throw new Error('hobby must be an array');
    }
    return true;
}


export function validateCreateMessageDto(createMessageDto: CreateMessageDto) {
    const { receiverId, text } = createMessageDto;

    if (!receiverId || typeof receiverId !== 'number' || isNaN(receiverId)) {
        throw new BadRequestException('Invalid receiverId');
    }

    if (typeof text !== 'string') {
        throw new BadRequestException('Invalid text');
    }

    if (text.trim() === '') {
        throw new BadRequestException('Text cannot be empty');
    }
}


export function validateEditMessageDto(editMessageDto: EditMessageDto) {
    const { editMessageId, text } = editMessageDto;

    if (!editMessageId || typeof editMessageId !== 'number' || isNaN(editMessageId)) {
        throw new BadRequestException('Invalid editMessageId');
    }

    if (typeof text !== 'string') {
        throw new BadRequestException('Invalid text');
    }

    if (text.trim() === '') {
        throw new BadRequestException('Text cannot be empty');
    }
}

export function validateDeleteMessageDto(deleteMessageDto: DeleteMessageDto) {
    const { id } = deleteMessageDto;

    if (!id || typeof id !== 'number' || isNaN(id)) {
        throw new BadRequestException('Invalid id');
    }
}
