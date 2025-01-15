import { CreatePersonDto } from '../auth/dto/createPerson.dto';


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