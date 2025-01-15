import * as path from 'path';
import * as fs from 'fs';
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


@Controller('persons')
export class PersonController {
	constructor(private readonly personService: PersonService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(
		@Query('take') take?: string,
		@Query('skip') skip?: string,
	): Promise<Omit<Person, 'password'>[] | { error: string }> {
		return this.personService.findAll(+take, +skip);
	}

	@Get('search')
	@UseGuards(JwtAuthGuard)
	async findBySearchString(@Query('person') person?: string,
	): Promise<Person[]> {
		if (person && person.length < 3) {
			throw new BadRequestException('Search query must be at least 3 characters long');
		}
		return this.personService.findBySearchString(person);
	}

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

	@Get(':id/find')
	@UseGuards(JwtAuthGuard)
	async findById(@Param('id') id: string): Promise<Omit<Person, 'password'>> {
		const personId: number = Number(id);
		if (isNaN(personId)) {
			throw new BadRequestException('Invalid ID format');
		}
		return this.personService.findById(personId);
	}

	@Get(':id/following')
	@UseGuards(JwtAuthGuard)
	async getFollowing(@Param('id') id: string): Promise<Omit<Person, 'password'>[]> {
		return this.personService.getFollowing(+id);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	getProfile(@Request() req: any): Promise<boolean | Omit<Person, 'password'>>  {
		return this.personService.findByUsername(req.user.username);
	}

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

	@Delete('me')
	@UseGuards(JwtAuthGuard)
	async remove(@Request() req: any): Promise<void> {
		if (!req.user.sub) {
			throw new Error('Unknown user')
		}
		return this.personService.remove(req.user.sub);
	}
}