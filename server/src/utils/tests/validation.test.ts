import { BadRequestException } from '@nestjs/common';

import { isValidData, validateCreateMessageDto, validateEditMessageDto, validateDeleteMessageDto }
    from '../validation.utils';


interface CreatePersonDto {
    firstName: string;
    lastName: string;
    password: string;
    username: string;
    description: string;
    hobby: string[];
    image: string;
}

const validPersonDto: CreatePersonDto = {
    firstName: 'User',
    lastName: 'New',
    password: 'newuser',
    username: 'user123',
    description: 'I am a new user',
    hobby: ['reading', 'gaming'],
    image: 'https://example.com/avatar.jpg'
};

const invalidPersonDto: Partial<CreatePersonDto> = {
    firstName: '',
    lastName: 'New',
    password: '123',
    username: '',
    description: '1234',
    hobby: ['string'],
    image: '',
};

describe('isValidData', () => {
    test('should return true for valid data', () => {
        expect(isValidData(validPersonDto)).toBe(true);
    });

    test('should throw error for missing required fields', (): void => {
        expect(() => isValidData({} as CreatePersonDto)).toThrow('Missing required fields');
    });

    test('should throw error for short password', (): void => {
        expect(() => isValidData({ ...validPersonDto, password: '123' } as CreatePersonDto))
            .toThrow('Password must be at least 6 characters long');
    });

    test('should throw error for invalid types', (): void => {
        expect(() => isValidData(invalidPersonDto as CreatePersonDto))
            .toThrow('Missing required fields');
    });

    test('should throw error if hobby is not an array', (): void => {
        expect(() => isValidData({ ...validPersonDto, hobby: 'not an array' } as unknown as CreatePersonDto))
            .toThrow('hobby must be an array');
    });
});

const validMessageDto: { receiverId: number, text: string } = { receiverId: 1, text: 'Hello' };
const invalidMessageDto: { receiverId: number, text: string } = { receiverId: 1, text: '' };

describe('validateCreateMessageDto', (): void => {
    test('should not throw error for valid data', (): void => {
        expect(() => validateCreateMessageDto(validMessageDto)).not.toThrow();
    });

    test('should throw error for empty text', (): void => {
        expect(() => validateCreateMessageDto(invalidMessageDto))
            .toThrow(BadRequestException);
    });
});

describe('validateEditMessageDto', (): void => {
    test('should not throw error for valid data', (): void => {
        expect(() => validateEditMessageDto({ editMessageId: 1, text: 'Updated message' }))
            .not.toThrow();
    });

    test('should throw error for empty text', (): void => {
        expect(() => validateEditMessageDto({ editMessageId: 1, text: '' }))
            .toThrow(BadRequestException);
    });
});

describe('validateDeleteMessageDto', (): void => {
    test('should not throw error for valid data', (): void => {
        expect(() => validateDeleteMessageDto({ id: 1 })).not.toThrow();
    });
});
