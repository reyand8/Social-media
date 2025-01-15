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

/**
 * Main function to seed the database with initial data and create subscriptions.
 */
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

/**
 * Creates random follow relationships (subscriptions) between seeded persons.
 */
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

/**
 * Returns a random subset of users from the given array, within the specified range.
 * @param users - Array of users to select from.
 * @param min - Minimum number of users to select.
 * @param max - Maximum number of users to select.
 */
function getRandomUsers(users: any[], min: number, max: number): any[] {
	const count: number = Math.floor(Math.random() * (max - min + 1)) + min;
	return shuffleArray(users).slice(0, count);
}

/**
 * Shuffles an array in random order.
 * @param array - Array to shuffle.
 * @returns A shuffled array.
 */
function shuffleArray(array: any[]): any[] {
	return array.sort(() => Math.random() - 0.5);
}

/**
 * Entry point: Executes the seeding process and handles errors.
 */
main()
	.catch((e): void => {
		console.error('Error seeding the database:', e);
	})
	.finally(async (): Promise<void> => {
		await prisma.$disconnect();
	});