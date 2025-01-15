import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Person} from '@prisma/client';

import {PrismaService} from '../prisma.service';
import {CreatePersonDto} from './dto/createPerson.dto';
import {UpdatePersonDto} from './dto/updatePerson.dto';


type PublicPerson = Omit<Person, 'password'>;

@Injectable()
export class PersonService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Select fields for public display of user data (excluding password).
	 */
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

	/**
	 * Fetch all persons with optional pagination.
	 * @param take - Number of records to fetch (default: 100).
	 * @param skip - Number of records to skip (default: 0).
	 * @returns An array of persons or an error message.
	 */
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

	/**
	 * Search persons by a given string in username or description.
	 * @param searchString - The string to search in username and description.
	 * @returns An array of persons matching the search string.
	 */
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

	/**
	 * Follow a person.
	 * @param followerId - ID of the user who is following.
	 * @param followedId - ID of the person being followed.
	 * @throws BadRequestException if the user tries to follow themselves or is already following the person.
	 */
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

	/**
	 * Unfollow a person.
	 * @param followerId - ID of the user who is unfollowing.
	 * @param followedId - ID of the person being unfollowed.
	 * @throws BadRequestException if the user tries to unfollow themselves or is not following the person.
	 */
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

	/**
	 * Get a list of people that the user is following.
	 * @param userId - The ID of the user whose following list is being fetched.
	 * @returns An array of persons that the user is following.
	 * @throws BadRequestException if the user ID is invalid.
	 */
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

	/**
	 * Find a person by username.
	 * @param username - The username to search for.
	 * @returns The person object if found, or false if not found.
	 * @throws BadRequestException if the username is invalid.
	 */
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

	/**
	 * Find a person by their ID.
	 * @param personId - The ID of the person to search for.
	 * @returns The person object if found.
	 * @throws BadRequestException if the ID format is invalid.
	 * @throws NotFoundException if the person is not found.
	 */
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

	/**
	 * Find a person by their username for validation purposes.
	 * @param username - The username to search for.
	 * @returns The person object if found, or null if not found.
	 */
	async findByUsernameForValidation(username: string): Promise<Person | null> {
		return this.prisma.person.findUnique({
			where: {username}
		});
	}

	/**
	 * Create a new person.
	 * @param createPersonDto - The data for the new person.
	 * @returns The created person object.
	 */
	async create(createPersonDto: CreatePersonDto): Promise<Person> {
		return this.prisma.person.create({
			data: { ...createPersonDto },
		});
	}

	/**
	 * Update an existing person.
	 * @param id - The ID of the person to update.
	 * @param updatePersonDto - The updated data.
	 * @returns The updated person object.
	 * @throws NotFoundException if the person with the specified ID is not found.
	 */
	async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
		const person = await this.prisma.person.findUnique({ where: { id }});
		if (!person) {
			throw new NotFoundException(`Person with id: ${id} not found`);
		}
		return this.prisma.person.update({ where: { id }, data: updatePersonDto });
	}

	/**
	 * Remove a person from the database.
	 * @param id - The ID of the person to delete.
	 * @throws NotFoundException if the person with the specified ID is not found.
	 */
	async remove(id: number): Promise<void> {
		const person= await this.prisma.person.findUnique({ where: { id } });
		if (!person) {
			throw new NotFoundException(`Person with id: ${id} not found`);
		}
		await this.prisma.person.delete({ where: { id } });
	}
}