import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Person } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PersonService } from '../person/person.service';
import {ICreatePersonDto, ITokens, IUser} from './auth.interface';

type PublicPerson = Omit<Person, 'password'>;

/**
 * Service for managing authentication-related operations.
 */
@Injectable()
export class AuthService {
    constructor(
        private personService: PersonService,
        private jwtService: JwtService,
    ) {}

    /**
     * Hashes the given password using bcrypt.
     * @param password - The password to hash.
     * @returns A promise resolving to the hashed password.
     */
    private async hashPassword(password: string): Promise<string> {
        if (!password) {
            throw new Error('Password is required to hash.');
        }
        return bcrypt.hash(password, 6);
    }

    /**
     * Generates a unique username based on the user's first and last name.
     * @param firstName - User's first name.
     * @param lastName - User's last name.
     * @returns A promise resolving to the generated username.
     */
    private async generateUsername(firstName: string, lastName: string): Promise<string> {
        let username: string;
        let randomNumbers: number;

        const generateRandomNumbers = (): string => {
            randomNumbers = Math.floor(1000 + Math.random() * 9000);
            return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNumbers}`;
        };
        username = generateRandomNumbers();
        while (await this.usernameExists(username)) {
            username = generateRandomNumbers();
        }
        return username;
    }

    /**
     * Checks if a username already exists in the database.
     * @param username - The username to check.
     * @returns A promise resolving to true if the username exists, otherwise false.
     */
    private async usernameExists(username: string): Promise<boolean> {
        const existingUser: PublicPerson | boolean = await this.personService.findByUsername(username);
        return !!existingUser;
    }

    /**
     * Generates access and refresh tokens for a user.
     * @param person - The user for whom tokens are being generated.
     * @returns A promise resolving to the tokens.
     */
    private async generateTokens(person: IUser): Promise<ITokens> {
        const payload: {username: string, sub: number} =
            { username: person.username, sub: person.id };
        const access_token: string = this.jwtService.sign(payload);
        const refresh_token: string = this.jwtService.sign(payload, { expiresIn: '1d' });
        return { access_token, refresh_token };
    }

    /**
     * Registers a new user.
     * @param createPersonDto - Data transfer object containing the user's registration details.
     * @returns A promise resolving to the user's tokens.
     */
    async register(createPersonDto: ICreatePersonDto): Promise<ITokens> {
        const { password, firstName, lastName  } = createPersonDto;
        createPersonDto.password = await this.hashPassword(password);
        createPersonDto.username = await this.generateUsername(firstName, lastName);

        const person: Person = await this.personService.create(createPersonDto);

        const { access_token, refresh_token } = await this.generateTokens(person);
        return { access_token, refresh_token };
    }

    /**
     * Logs a user into the system and generates tokens.
     * @param person - The user to log in.
     * @returns A promise resolving to the user's tokens.
     */
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

    /**
     * Validates a user's credentials.
     * @param username - The username to validate.
     * @param pass - The password to validate.
     * @returns A promise resolving to the user if valid, otherwise null.
     */
    async validateUser(username: string, pass: string): Promise<Person | null> {
        const user: Person = await this.personService.findByUsernameForValidation(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        return null;
    }
}
