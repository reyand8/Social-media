import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { persons } from './persons.data';


export interface IPerson {
	id: number;
	firstName: string;
	lastName: string;
	username: string;
	description: string;
	hobby: string[];
	image: string;
	password: string;
}

const prisma = new PrismaClient();
dotenv.config();

async function main(): Promise<void> {
	console.log('Database seeding started...');
	await Promise.all(
		persons.map(async (person: IPerson): Promise<void> => {
			await prisma.person.create({
				data: {
					firstName: person.firstName,
					lastName: person.lastName,
					username: person.username,
					description: person.description,
					hobby: person.hobby,
					image: person.image,
					password: person.password,
				},
			});
		})
	);
	await createSubscriptions();
	console.log('Database was seeded successfully...');
}

async function createSubscriptions(): Promise<void> {
	const persons: IPerson[] = await prisma.person.findMany();
	if (persons.length < 2) {
		console.log('There are less than 2 persons');
		return;
	}
	await Promise.all(
		persons.map(async (person: IPerson): Promise<void> => {
			const otherUsers: IPerson[] = persons.filter(
				(p: IPerson): boolean => p.id !== person.id);
			const subscriptions: IPerson[] = getRandomUsers(otherUsers, 2, 3);

			await Promise.all(
				subscriptions.map(async (followedUser: IPerson): Promise<void> => {
					await prisma.follower.create({
						data: {
							followerId: person.id,
							followedId: followedUser.id,
						},
					});
				})
			);
		})
	);
}


function getRandomUsers(users: any[], min: number, max: number): any[] {
	const count: number = Math.floor(Math.random() * (max - min + 1)) + min;
	return shuffleArray(users).slice(0, count);
}


function shuffleArray(array: any[]): any[] {
	return array.sort(() => Math.random() - 0.5);
}

main()
	.catch((e): void => {
		console.error('Error seeding the database:', e);
	})
	.finally(async (): Promise<void> => {
		await prisma.$disconnect();
	});
