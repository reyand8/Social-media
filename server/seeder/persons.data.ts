export interface IPerson {
	firstName: string;
	lastName: string;
	username: string;
	description: string;
	hobby: string[];
	image: string;
	password: string;
}

export const persons: IPerson[] = [
	{
		firstName: 'John',
		lastName: 'Doe',
		username: 'JohnDoe472',
		description: 'A passionate software developer with a love for coding and learning new technologies.',
		hobby: ['Reading', 'Coding', 'Cycling', 'Gaming'],
		image: '/uploads/people/Men2.jpg',
		password: 'password123',
	},
	{
		firstName: 'Emily',
		lastName: 'Clark',
		username: 'EmilyClark921',
		description: 'A creative graphic designer with a knack for turning ideas into visual masterpieces.',
		hobby: ['Painting', 'Photography', 'Traveling', 'Music'],
		image: '/uploads/people/Women1.jpg',
		password: 'password123',
	},
	{
		firstName: 'Michael',
		lastName: 'Brown',
		username: 'MichaelBrown384',
		description: 'An entrepreneur who enjoys networking and building innovative solutions.',
		hobby: ['Reading', 'Hiking', 'Traveling', 'Investing', 'Yoga'],
		image: '/uploads/people/Men1.jpg',
		password: 'password123',
	},
	{
		firstName: 'Sophia',
		lastName: 'Davis',
		username: 'SophiaDavis157',
		description: 'An enthusiastic chef with a flair for creating delicious dishes from around the world.',
		hobby: ['Cooking', 'Gardening', 'Photography', 'Baking', 'Yoga'],
		image: '/uploads/people/Women2.jpg',
		password: 'password123',
	},
	{
		firstName: 'William',
		lastName: 'Johnson',
		username: 'WilliamJohnson856',
		description: 'A fitness enthusiast who loves to inspire others to lead a healthy lifestyle.',
		hobby: ['Running', 'Swimming', 'Weightlifting', 'Meditation'],
		image: '/uploads/people/Men3.jpg',
		password: 'password123',
	},
	{
		firstName: 'Olivia',
		lastName: 'Martinez',
		username: 'OliviaMartinez604',
		description: 'A travel blogger who captures the beauty of the world one destination at a time.',
		hobby: ['Traveling', 'Writing', 'Photography', 'Yoga', 'Meditation'],
		image: '/uploads/people/Women3.jpg',
		password: 'password123',
	},
];
