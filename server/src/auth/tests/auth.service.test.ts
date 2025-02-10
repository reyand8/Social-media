import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Person } from '@prisma/client';

import { AuthService } from '../auth.service';
import { PersonService } from '../../person/person.service';
import { ICreatePersonDto, ITokens } from '../auth.interface';


describe('AuthService', (): void => {
    let authService: AuthService;
    let personService: PersonService;
    let jwtService: JwtService;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PersonService,
                    useValue: {
                        findByUsername: jest.fn(),
                        create: jest.fn(),
                        findByUsernameForValidation: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
            ],
        }).compile();
        authService = module.get<AuthService>(AuthService);
        personService = module.get<PersonService>(PersonService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('register', (): void => {
        it('should register a new user and return tokens', async (): Promise<void> => {
            const createPersonDto: ICreatePersonDto = {
                firstName: 'John',
                lastName: 'Doe',
                username: 'JohnDoe472',
                description: 'A passionate software developer',
                hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
                image: '/uploads/people/Men2.jpg',
                password: 'hashedPassword123',
            };
            const hashedPassword: string = 'hashedPassword123';
            const username: string = 'johndoe1234';
            const person: Person = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: username,
                description: 'A passionate software developer',
                hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
                image: '/uploads/people/Men2.jpg',
                createdAt: new Date("2000-01-01"),
                password: hashedPassword,
            };
            const tokens: ITokens = {
                access_token: 'accessToken',
                refresh_token: 'refreshToken',
            };

            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
            jest.spyOn(personService, 'create').mockResolvedValue(person);
            jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokens.access_token);
            jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokens.refresh_token);

            const result: ITokens = await authService.register(createPersonDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(createPersonDto.password, 6);
            expect(personService.create).toHaveBeenCalledWith({
                ...createPersonDto,
                password: hashedPassword,
                username: expect.any(String),
            });
            expect(result).toEqual(tokens);
        });
    });

    describe('login', (): void => {
        it('should return tokens for a logged-in user', async (): Promise<void> => {
            const person: Person = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: 'JohnDoe472',
                description: 'A passionate software developer',
                hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
                image: '/uploads/people/Men2.jpg',
                createdAt: new Date("2000-01-01"),
                password: 'password123',
            };
            const tokens: ITokens = {
                access_token: 'accessToken',
                refresh_token: 'refreshToken',
            };

            jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokens.access_token);
            jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokens.refresh_token);

            const result: ITokens = await authService.login(person);

            expect(jwtService.sign).toHaveBeenCalledWith({ username: person.username, sub: person.id });
            expect(jwtService.sign).toHaveBeenCalledWith(
                { username: person.username, sub: person.id },
                { expiresIn: '1d' },
            );
            expect(result).toEqual(tokens);
        });
    });

    describe('validateUser', (): void => {
        it('should return user if credentials are valid', async (): Promise<void> => {
            const username: string = 'johndoe1234';
            const password: string = 'password123';
            const hashedPassword: string = 'hashedPassword123';
            const user: Person = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: username,
                description: 'A passionate software developer',
                hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
                image: '/uploads/people/Men2.jpg',
                createdAt: new Date("2000-01-01"),
                password: hashedPassword,
            };

            jest.spyOn(personService, 'findByUsernameForValidation').mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

            const result = await authService.validateUser(username, password);

            expect(personService.findByUsernameForValidation).toHaveBeenCalledWith(username);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
            expect(result).toEqual(user);
        });

        it('should return null if credentials are invalid', async (): Promise<void> => {
            const username: string = 'johndoe1234';
            const password: string = 'wrongPassword';
            const user: Person = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                username: username,
                description: 'A passionate software developer',
                hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
                image: '/uploads/people/Men2.jpg',
                createdAt: new Date("2000-01-01"),
                password: password,
            };

            jest.spyOn(personService, 'findByUsernameForValidation').mockResolvedValue(user);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

            const result = await authService.validateUser(username, password);

            expect(personService.findByUsernameForValidation).toHaveBeenCalledWith(username);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
            expect(result).toBeNull();
        });
    });
});