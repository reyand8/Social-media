import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Person} from '@prisma/client';

import {PrismaService} from '../prisma.service';
import {CreatePersonDto} from './dto/createPerson.dto';
import {UpdatePersonDto} from './dto/updatePerson.dto';


type PublicPerson = Omit<Person, 'password'>;

@Injectable()
export class PersonService {
	constructor(private prisma: PrismaService) {}

	private get publicPersonSelect()  {
		return {
			id: true,
			firstName: true,
			lastName: true,
			username: true,
			description: true,
			hobby: true,
			image: true,
			createdAt: true,
		};
	}

	async findAll(take?: number, skip?: number): Promise<PublicPerson[] | { error: string }> {
		const DEFAULT_TAKE: 100 = 100;
		const DEFAULT_SKIP: 0 = 0;
		if(!take || !skip) {
			take = DEFAULT_TAKE;
			skip = DEFAULT_SKIP;
		}
		try {
			const persons = await this.prisma.person.findMany({
				skip,
				take,
				select: this.publicPersonSelect,
			});
			if (persons.length === 0) {
				return [];
			}
			return persons;
		} catch (error) {
			return { error: `An error occurred while fetching persons` };
		}
	}

	async findBySearchString(searchString?: string): Promise<Person[]> {
		if (!searchString) {
			return [];
		}
		return this.prisma.person.findMany({
			where: {
				OR: [
					{
						username: {
							contains: searchString,
							mode: 'insensitive'
						}
					},
					{
						description: {
							contains: searchString,
							mode: 'insensitive'
						}
					}
				]
			}
		});
	}

	async followPerson(followerId: number, followedId: number): Promise<void> {
		if (followedId === followerId) {
			throw new BadRequestException('You can not follow yourself');
		}
		const existingFollow = await this.prisma.follower.findUnique({
			where: {
				followerId_followedId: {
					followerId,
					followedId
				}
			}
		});
		if (existingFollow) {
			throw new BadRequestException('You are already following this user');
		}
		await this.prisma.follower.create({
			data: {
				followerId,
				followedId
			}
		});
	}

	async unfollowPerson(followerId: number, followedId: number): Promise<void> {
		if (followedId === followerId) {
			throw new BadRequestException('You cannot unfollow yourself');
		}
		const existingFollow = await this.prisma.follower.findUnique({
			where: {
				followerId_followedId: {
					followerId,
					followedId
				}
			}
		});
		if (!existingFollow) {
			throw new BadRequestException('You are not following this user');
		}
		await this.prisma.follower.delete({
			where: {
				followerId_followedId: {
					followerId,
					followedId
				}
			}
		});
	}

	async getFollowing(userId: number): Promise<PublicPerson[]> {
		if (isNaN(userId)) {
			throw new BadRequestException('Invalid userId');
		}
		const following = await this.prisma.follower.findMany({
			where: {
				followerId: userId,
			},
			include: {
				followed: {
					select: this.publicPersonSelect,
				},
			},
		});
		return following.map((f) => f.followed);
	}

	async findByUsername(username: string): Promise<PublicPerson | boolean> {
		if (!username) {
			throw new BadRequestException('Invalid username');
		}
		const person: PublicPerson = await this.prisma.person.findUnique({
			where: { username },
			select: this.publicPersonSelect,
		});
		if (!person) {
			return false;
		}
		return person;
	}

	async findById(personId: number): Promise<PublicPerson> {
		const id: number = Number(personId);
		if (isNaN(id)) {
			throw new BadRequestException('Invalid ID format');
		}
		const person: PublicPerson = await this.prisma.person.findUnique({
			where: { id },
			select: this.publicPersonSelect,
		});
		if (!person) {
			throw new NotFoundException(`Person with id: ${id} not found`);
		}
		return person;
	}

	async findByUsernameForValidation(username: string): Promise<Person | null> {
		return this.prisma.person.findUnique({
			where: {username}
		});
	}

	async create(createPersonDto: CreatePersonDto): Promise<Person> {
		return this.prisma.person.create({
			data: { ...createPersonDto },
		});
	}

	async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
		const person = await this.prisma.person.findUnique({ where: { id }});
		if (!person) {
			throw new NotFoundException(`Person with id: ${id} not found`);
		}
		return this.prisma.person.update({ where: { id }, data: updatePersonDto });
	}

	async remove(id: number): Promise<void> {
		const person= await this.prisma.person.findUnique({ where: { id } });
		if (!person) {
			throw new NotFoundException(`Person with id: ${id} not found`);
		}
		await this.prisma.person.delete({ where: { id } });
	}
}