import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PersonModule } from '../person/person.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';


@Module({
	imports: [forwardRef(() => PersonModule),
		JwtModule.register({ secret: process.env.JWT_SECRET_KEY, signOptions: { expiresIn: '60m' } })],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtAuthGuard],
	exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
