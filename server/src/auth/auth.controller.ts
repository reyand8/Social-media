import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

import { CreatePersonDto } from './dto/createPerson.dto';
import { AuthService } from './auth.service';
import { ITokens, IUser } from './auth.interface';


@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createPersonDto: CreatePersonDto): Promise<ITokens> {
		if (createPersonDto.image) {
			const base64Data: string = createPersonDto.image.replace(/^data:image\/\w+;base64,/, '');  // Убираем префикс
			const imageBuffer: Buffer<ArrayBuffer> = Buffer.from(base64Data, 'base64');
			const imagePath: string = path.join(__dirname, '../../uploads/people', `${Date.now()}.jpg`);
			fs.writeFileSync(imagePath, imageBuffer);
			createPersonDto.image = `/uploads/people/${path.basename(imagePath)}`;
		} else {
				createPersonDto.image = '/uploads/people/default.png';
		}
		return this.authService.register(createPersonDto);
	}

	@Post('login')
	@HttpCode(200)
	async login(@Body() loginDto: { username: string, password: string }): Promise<ITokens> {
		const user: IUser =
			await this.authService.validateUser(loginDto.username, loginDto.password);
		if (!user) {
			throw new Error('Invalid credentials');
		}
		return this.authService.login(user);
	}
}
