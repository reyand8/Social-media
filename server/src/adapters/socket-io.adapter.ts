import { IoAdapter } from '@nestjs/platform-socket.io';

import { Server } from 'socket.io';


export class SocketIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any): Server {
        return super.createIOServer(port, options);
    }
}
