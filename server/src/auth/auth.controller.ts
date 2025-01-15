import {
	Controller, Post, Body, UnauthorizedException,
	HttpException, HttpStatus, BadRequestException
} from '@nestjs/common';

import { CreatePersonDto } from './dto/createPerson.dto';
import { LoginPersonDto } from './dto/loginPerson.dto';
import { AuthService } from './auth.service';
import { ITokens, IUser } from './auth.interface';

import { saveImageFromBase64 } from '../utils/image.utils';
import { isValidData } from '../utils/validation.utils';


@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() createPersonDto: CreatePersonDto): Promise<ITokens> {
		try {
			if (isValidData(createPersonDto)) {
				if (createPersonDto.image) {
					createPersonDto.image = saveImageFromBase64(createPersonDto.image)
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
	async login(@Body() LoginPersonDto: LoginPersonDto): Promise<ITokens> {
		const { username, password } = LoginPersonDto
		if (typeof username !== 'string' || typeof password !== 'string') {
			throw new BadRequestException('Invalid username or password');
		}
		const user: IUser =
			await this.authService.validateUser(username, password);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		return this.authService.login(user);
	}
}
