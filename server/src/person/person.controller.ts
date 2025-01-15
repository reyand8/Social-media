import {
	Controller, Get,
	Body, Patch, Param, Delete,
	Query, Request, UseGuards, Post, NotFoundException, BadRequestException
} from '@nestjs/common';

import { Person } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonService } from './person.service';
import { UpdatePersonDto } from './dto/updatePerson.dto';
import {saveImageFromBase64} from "../utils/image.utils";


/**
 * PersonController is responsible for managing person-related actions, including:
 * - Retrieving a list of persons
 * - Searching for persons by string
 * - Following and unfollowing persons
 * - Retrieving a person's profile
 * - Updating and deleting the current user's profile
 */
@Controller('persons')
export class PersonController {
	constructor(private readonly personService: PersonService) {}

	/**
	 * Get a list of all persons.
	 * @param take The number of persons to retrieve.
	 * @param skip The number of persons to skip (pagination).
	 * @returns An array of persons without passwords.
	 */
	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(
		@Query('take') take?: string,
		@Query('skip') skip?: string,
	): Promise<Omit<Person, 'password'>[] | { error: string }> {
		return this.personService.findAll(+take, +skip);
	}

	/**
	 * Search for persons based on a query string.
	 * @param person The query string used to search for persons by username or description.
	 * @returns An array of persons matching the search query.
	 * @throws BadRequestException if the search query is less than 3 characters.
	 */
	@Get('search')
	@UseGuards(JwtAuthGuard)
	async findBySearchString(@Query('person') person?: string,
	): Promise<Person[]> {
		if (person && person.length < 3) {
			throw new BadRequestException('Search query must be at least 3 characters long');
		}
		return this.personService.findBySearchString(person);
	}

	/**
	 * Follow another person.
	 * @param followedId The ID of the person to follow.
	 * @param req The request object containing the current user's ID.
	 * @returns void
	 * @throws NotFoundException if the user is already following the person.
	 */
	@Post(':id/follow')
	@UseGuards(JwtAuthGuard)
	async followPerson(@Param('id') followedId: string, @Request() req: any): Promise<void> {
		const followerId = req.user.sub;
		try {
			await this.personService.followPerson(+followerId, +followedId);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException('You are already following this user');
			}
			throw error;
		}
	}

	/**
	 * Unfollow a person.
	 * @param followedId The ID of the person to unfollow.
	 * @param req The request object containing the current user's ID.
	 * @returns void
	 * @throws NotFoundException if the user is not following the person.
	 */
	@Post(':id/unfollow')
	@UseGuards(JwtAuthGuard)
	async unfollowPerson(@Param('id') followedId: string, @Request() req: any): Promise<void> {
		const followerId = req.user.sub;
		try {
			await this.personService.unfollowPerson(+followerId, +followedId);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException('You are not following this user');
			}
			throw error;
		}
	}

	/**
	 * Get a person's profile by their ID.
	 * @param id The ID of the person to retrieve.
	 * @returns The person's profile without password.
	 * @throws BadRequestException if the ID format is invalid.
	 */
	@Get(':id/find')
	@UseGuards(JwtAuthGuard)
	async findById(@Param('id') id: string): Promise<Omit<Person, 'password'>> {
		const personId: number = Number(id);
		if (isNaN(personId)) {
			throw new BadRequestException('Invalid ID format');
		}
		return this.personService.findById(personId);
	}

	/**
	 * Get a list of people that the specified person is following.
	 * @param id The ID of the person whose following list is to be retrieved.
	 * @returns An array of people that the user is following.
	 */
	@Get(':id/following')
	@UseGuards(JwtAuthGuard)
	async getFollowing(@Param('id') id: string): Promise<Omit<Person, 'password'>[]> {
		return this.personService.getFollowing(+id);
	}

	/**
	 * Get the profile of the currently authenticated user.
	 * @param req The request object containing the current user's information.
	 * @returns The profile of the current user.
	 */
	@Get('me')
	@UseGuards(JwtAuthGuard)
	getProfile(@Request() req: any): Promise<boolean | Omit<Person, 'password'>>  {
		return this.personService.findByUsername(req.user.username);
	}

	/**
	 * Update the current user's profile.
	 * @param updatePersonDto The data to update the user's profile.
	 * @param req The request object containing the current user's information.
	 * @returns The updated person.
	 */
	@Patch('me')
	@UseGuards(JwtAuthGuard)
	async update(@Body() updatePersonDto: UpdatePersonDto, @Request() req: any): Promise<Person> {
		if (updatePersonDto.image) {
			updatePersonDto.image = saveImageFromBase64(updatePersonDto.image)
		} else {
			updatePersonDto.image = '/uploads/people/default.png';
		}
		return this.personService.update(req.user.sub, updatePersonDto);
	}

	/**
	 * Delete the current user's profile.
	 * @param req The request object containing the current user's information.
	 * @returns void
	 * @throws Error if the user is not found.
	 */
	@Delete('me')
	@UseGuards(JwtAuthGuard)
	async remove(@Request() req: any): Promise<void> {
		if (!req.user.sub) {
			throw new Error('Unknown user')
		}
		return this.personService.remove(req.user.sub);
	}
}