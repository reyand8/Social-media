import {
	Controller, Post, Body, UnauthorizedException,
	HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

import { CreatePersonDto } from './dto/createPerson.dto';
import { AuthService } from './auth.service';
import { ITokens, IUser } from './auth.interface';


function isValidData(createPersonDto: CreatePersonDto): boolean {
	if (!createPersonDto.firstName || !createPersonDto.lastName || !createPersonDto.password) {
		throw new Error('Missing required fields');
	}
	if (createPersonDto.password.length < 6) {
		throw new Error('Password must be at least 6 characters long');
	}
	return true;
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createPersonDto: CreatePersonDto): Promise<ITokens> {
		try {
			if (isValidData(createPersonDto)) {
				if (createPersonDto.image) {
					const base64Data: string = createPersonDto.image.replace(/^data:image\/\w+;base64,/, '');
					const imageBuffer: Buffer = Buffer.from(base64Data, 'base64');
					const imagePath: string = path.join(__dirname, '../../uploads/people', `${Date.now()}.jpg`);
					fs.writeFileSync(imagePath, imageBuffer);
					createPersonDto.image = `/uploads/people/${path.basename(imagePath)}`;
				} else {
					createPersonDto.image = '/uploads/people/default.png';
				}
				return this.authService.register(createPersonDto);
			}
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	@Post('login')
	async login(@Body() loginDto: { username: string, password: string }): Promise<ITokens> {
		const user: IUser =
			await this.authService.validateUser(loginDto.username, loginDto.password);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		return this.authService.login(user);
	}
}
