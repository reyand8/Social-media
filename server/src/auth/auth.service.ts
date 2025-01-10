import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Person } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PersonService } from '../person/person.service';
import {IPerson} from '../person.interface';
import {ICreatePersonDto, ITokens, IUser} from './auth.interface';


@Injectable()
export class AuthService {
    constructor(
        private personService: PersonService,
        private jwtService: JwtService,
    ) {}

    private async hashPassword(password: string): Promise<string> {
        if (!password) {
            throw new Error('Password is required to hash.');
        }
        return bcrypt.hash(password, 6);
    }

    private generateUsername(firstName: string, lastName: string): string {
        const randomNumbers: number = Math.floor(100 + Math.random() * 900);
        return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNumbers}`;
    }

    private async usernameExists(username: string): Promise<void> {
        const existingUser: IPerson | boolean = await this.personService.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
    }

    private async generateTokens(person: IUser): Promise<ITokens> {
        const payload: {username: string, sub: number} =
            { username: person.username, sub: person.id };
        const access_token: string = this.jwtService.sign(payload);
        const refresh_token: string = this.jwtService.sign(payload, { expiresIn: '1d' });
        return { access_token, refresh_token };
    }

    async register(createPersonDto: ICreatePersonDto): Promise<ITokens> {
        const { password, firstName, lastName  } = createPersonDto;
        createPersonDto.password = await this.hashPassword(password);
        createPersonDto.username = this.generateUsername(firstName, lastName);

        await this.usernameExists(createPersonDto.username);
        const person: Person = await this.personService.create(createPersonDto);

        const { access_token, refresh_token } = await this.generateTokens(person);
        return { access_token, refresh_token };
    }

    async login(person: Person): Promise<ITokens> {
        const payload: { username: string, sub: number }
            = { username: person.username, sub: person.id };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: '1d',
            }),
        };
    }

    async validateUser(username: string, pass: string): Promise<Person | null> {
        const user: Person = await this.personService.findByUsernameForValidation(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        return null;
    }
}
