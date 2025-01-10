import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { Person } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { CreatePersonDto } from './dto/createPerson.dto';
import { UpdatePersonDto } from './dto/updatePerson.dto';


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

	async findAll(
		take?: number,
		skip?: number,
	): Promise<PublicPerson[]> {
		const DEFAULT_TAKE: 100 = 100;
		const DEFAULT_SKIP: 0 = 0;
		if(!take || !skip) {
			take = DEFAULT_TAKE;
			skip = DEFAULT_SKIP;
		}
		return this.prisma.person.findMany({
			skip,
			take,
			select: this.publicPersonSelect,
		});
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

	async findByUsername(username: string): Promise<PublicPerson | boolean> {
		const person: PublicPerson = await this.prisma.person.findUnique({
			where: { username },
			select: this.publicPersonSelect,
		});
		if (!person) {
		  return false;
		}
		return person;
	}

	async findByUsernameForValidation(username: string): Promise<Person | null> {
		const person: Person = await this.prisma.person.findUnique({
			where: {username},
		});
		if (!person) {
			throw new NotFoundException(`Person with username: ${username} not found`);
		}
		return person;
	}

	async getFollowing(userId: number): Promise<PublicPerson[]> {
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

	async create(createPersonDto: CreatePersonDto): Promise<Person> {
		return this.prisma.person.create({
			data: { ...createPersonDto },
		});
	}

	async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
		const person: Person = await this.prisma.person.findUnique({ where: { id }});
		if (!person)
			throw new NotFoundException(`Person with id: ${id} not found`);
		return this.prisma.person.update({ where: { id }, data: updatePersonDto });
	}

	async remove(id: number): Promise<void> {
		const person: Person =
			await this.prisma.person.findUnique({ where: { id } });
		if (!person) throw new NotFoundException(`Person with id: ${id} not found`);
		await this.prisma.person.delete({ where: { id } });
	}
}