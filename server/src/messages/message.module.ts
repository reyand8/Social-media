import { Module } from '@nestjs/common';

import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { SocketService } from './sockets/socket.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [AuthModule],
    providers: [MessageService, SocketService, PrismaService],
    controllers: [MessageController],
})
export class MessageModule {}
