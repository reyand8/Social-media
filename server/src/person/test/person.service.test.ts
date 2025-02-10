import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PersonService } from '../person.service';
import { PrismaService } from '../../prisma.service';
import { CreatePersonDto } from '../dto/createPerson.dto';
import { UpdatePersonDto } from '../dto/updatePerson.dto';


describe('PersonService', (): void  => {
    let service: PersonService;
    let prisma: PrismaService;

    beforeEach(async (): Promise<void> => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PersonService,
                {
                    provide: PrismaService,
                    useValue: {
                        person: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        follower: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            delete: jest.fn(),
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PersonService>(PersonService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', (): void  => {
        expect(service).toBeDefined();
    });

    describe('findAll', (): void  => {
        it('should return an array of persons', async (): Promise<void> => {
            const result = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
            (prisma.person.findMany as jest.Mock).mockResolvedValue(result);

            expect(await service.findAll()).toEqual(result);
        });

        it('should handle errors', async (): Promise<void>  => {
            (prisma.person.findMany as jest.Mock).mockRejectedValue(new Error('Error'));

            expect(await service.findAll()).toEqual({ error: 'An error occurred while fetching persons' });
        });
    });

    describe('findBySearchString', (): void  => {
        it('should return an array of persons matching the search string', async (): Promise<void> => {
            const result = [{ id: 1, username: 'johndoe', description: 'A guy named John' }];
            (prisma.person.findMany as jest.Mock).mockResolvedValue(result);

            expect(await service.findBySearchString('john')).toEqual(result);
        });

        it('should return an empty array if no search string is provided', async (): Promise<void>  => {
            expect(await service.findBySearchString()).toEqual([]);
        });
    });

    describe('followPerson', (): void  => {
        it('should throw an error if user tries to follow themselves', async (): Promise<void>  => {
            await expect(service.followPerson(1, 1)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if user is already following the person', async (): Promise<void>  => {
            (prisma.follower.findUnique as jest.Mock).mockResolvedValue({});
            await expect(service.followPerson(1, 2)).rejects.toThrow(BadRequestException);
        });

        it('should successfully follow a person', async (): Promise<void>  => {
            (prisma.follower.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.followPerson(1, 2)).resolves.not.toThrow();
        });
    });

    describe('unfollowPerson', (): void  => {
        it('should throw an error if user tries to unfollow themselves', async (): Promise<void>  => {
            await expect(service.unfollowPerson(1, 1)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if user is not following the person', async (): Promise<void>  => {
            (prisma.follower.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.unfollowPerson(1, 2)).rejects.toThrow(BadRequestException);
        });

        it('should successfully unfollow a person', async (): Promise<void>  => {
            (prisma.follower.findUnique as jest.Mock).mockResolvedValue({});
            await expect(service.unfollowPerson(1, 2)).resolves.not.toThrow();
        });
    });

    describe('getFollowing', (): void  => {
        it('should throw an error for invalid userId', async (): Promise<void>  => {
            await expect(service.getFollowing(NaN)).rejects.toThrow(BadRequestException);
        });

        it('should return an array of persons the user is following', async (): Promise<void>  => {
            const result = [{ followed: { id: 2, firstName: 'Jane', lastName: 'Doe' } }];
            (prisma.follower.findMany as jest.Mock).mockResolvedValue(result);

            expect(await service.getFollowing(1)).toEqual(result.map(f => f.followed));
        });
    });

    describe('findByUsername', (): void  => {
        it('should throw an error for invalid username', async (): Promise<void>  => {
            await expect(service.findByUsername('')).rejects.toThrow(BadRequestException);
        });

        it('should return false if person not found', async (): Promise<void>  => {
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(null);
            expect(await service.findByUsername('unknown')).toBe(false);
        });

        it('should return a person if found', async (): Promise<void>  => {
            const result = { id: 1, username: 'johndoe' };
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(result);
            expect(await service.findByUsername('johndoe')).toEqual(result);
        });
    });

    describe('findById', (): void  => {
        it('should throw an error for invalid ID format', async (): Promise<void>  => {
            await expect(service.findById(NaN)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if person not found', async (): Promise<void>  => {
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.findById(999)).rejects.toThrow(NotFoundException);
        });

        it('should return a person if found', async (): Promise<void>  => {
            const result = { id: 1, firstName: 'John', lastName: 'Doe' };
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(result);
            expect(await service.findById(1)).toEqual(result);
        });
    });

    describe('create', (): void  => {
        it('should create a new person', async (): Promise<void>  => {
            const createPersonDto: CreatePersonDto = {
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                description: 'fre',
                hobby: ['hi'],
                image: 'image.png',
                password: 'password' };
            const result = { id: 1, ...createPersonDto };
            (prisma.person.create as jest.Mock).mockResolvedValue(result);

            expect(await service.create(createPersonDto)).toEqual(result);
        });
    });

    describe('update', (): void  => {
        it('should throw an error if person not found', async (): Promise<void>  => {
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(null);
            const updatePersonDto: UpdatePersonDto = { firstName: 'Johnny' };

            await expect(service.update(999, updatePersonDto)).rejects.toThrow(NotFoundException);
        });

        it('should update a person', async (): Promise<void>  => {
            const existingPerson = { id: 1, firstName: 'John', lastName: 'Doe' };
            const updatePersonDto: UpdatePersonDto = { firstName: 'Johnny' };
            const updatedPerson = { ...existingPerson, ...updatePersonDto };

            (prisma.person.findUnique as jest.Mock).mockResolvedValue(existingPerson);
            (prisma.person.update as jest.Mock).mockResolvedValue(updatedPerson);

            expect(await service.update(1, updatePersonDto)).toEqual(updatedPerson);
        });
    });

    describe('remove', (): void => {
        it('should throw an error if person not found', async (): Promise<void>  => {
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });

        it('should delete a person', async (): Promise<void>  => {
            const existingPerson = { id: 1, firstName: 'John', lastName: 'Doe' };
            (prisma.person.findUnique as jest.Mock).mockResolvedValue(existingPerson);
            await expect(service.remove(1)).resolves.not.toThrow();
        });
    });
});