import {
	Controller, Get,
	Body, Patch, Param, Delete,
	Query, Request, UseGuards
} from '@nestjs/common';

import { Person } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonService } from './person.service';
import { UpdatePersonDto } from './dto/updatePerson.dto';


@Controller('persons')
export class PersonController {
	constructor(private readonly personService: PersonService) {}

	@Get()
	async findAll(
		@Query('take') take?: string,
		@Query('skip') skip?: string,
	): Promise<Omit<Person, 'password'>[]> {
		return this.personService.findAll(+take, +skip);
	}

	// @Get(':id')
	// async findById(@Param('id') id: string) {
	// 	const personId = Number(id);
	// 	if (isNaN(personId)) {
	// 		throw new BadRequestException('Invalid ID format');
	// 	}
	// 	return this.personService.findById(personId);
	// }

	@Get(':id/following')
	async getFollowing(@Param('id') id: string): Promise<Omit<Person, 'password'>[]> {
		return this.personService.getFollowing(+id);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	getProfile(@Request() req: any): Promise<Omit<Person, 'password'>>  {
		return this.personService.findByUsername(req.user.username);
	}

	@Patch('me')
	@UseGuards(JwtAuthGuard)
	async update(@Body() updatePersonDto: UpdatePersonDto, @Request() req: any): Promise<Person> {
		return this.personService.update(req.user.id, updatePersonDto);
	}

	@Delete('me')
	@UseGuards(JwtAuthGuard)
	async remove(@Request() req: any): Promise<void> {
		return this.personService.remove(req.user.id);
	}
}