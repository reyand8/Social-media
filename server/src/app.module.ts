import {Module, OnModuleInit} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { path } from 'app-root-path';
import { ServerOptions } from 'socket.io';

import { PrismaService } from './prisma.service';
import { PersonModule } from './person/person.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './messages/message.module';
import { SocketIoAdapter } from './adapters/socket-io.adapter';
import { SocketService } from './messages/sockets/socket.service';
import { SocketModule } from './messages/sockets/socket.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads/people`,
      serveRoot: '/uploads/people',
    }),
    AuthModule,
    PersonModule,
    MessageModule,
    SocketModule,
  ],
  controllers: [],
  providers: [
      PrismaService,
      SocketIoAdapter,
  ],
})

export class AppModule implements OnModuleInit {
  constructor(private socketService: SocketService) {}

  onModuleInit(): void {
    const options: any = {
      cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    };

    const server =
        new SocketIoAdapter().createIOServer(3001, options);
    this.socketService.setServer(server);

    server.on('connection', (socket): void => {
      this.socketService.onConnection(socket);
    });
  }

}