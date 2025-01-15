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

/**
 * `AuthController` handles HTTP routes related to authentication such as user registration and login.
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Handles the registration of a new user.
	 * @param createPersonDto - Data Transfer Object containing registration details.
	 * @returns A Promise containing access and refresh tokens.
	 * @throws HttpException if validation fails or an error occurs during registration.
	 */
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

	/**
	 * Handles user login.
	 * @param LoginPersonDto - Data Transfer Object containing login credentials.
	 * @returns A Promise containing access and refresh tokens.
	 * @throws BadRequestException if input data is invalid.
	 * @throws UnauthorizedException if credentials are incorrect.
	 */
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
