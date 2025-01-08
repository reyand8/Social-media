import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';

import { PrismaService } from './prisma.service';
import { PersonModule } from './person/person.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads/people`,
      serveRoot: '/uploads/people',
    }),
    AuthModule,
    PersonModule,
  ],
  controllers: [],
  providers: [PrismaService],
})

export class AppModule {}