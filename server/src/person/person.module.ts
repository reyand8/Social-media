import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { AuthModule } from 'src/auth/auth.module';


@Module({
	imports: [AuthModule],
	controllers: [PersonController],
	providers: [PersonService, PrismaService],
	exports: [PersonService],
})

export class PersonModule {}