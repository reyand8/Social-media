import { IoAdapter } from '@nestjs/platform-socket.io';

import { Server } from 'socket.io';


/**
 * Custom Socket.IO adapter.
 *
 * @param {number} port - Port for the Socket.IO server.
 * @param {any} [options] - Optional server configuration.
 * @returns {Server} The Socket.IO server instance.
 */
export class SocketIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any): Server {
        return super.createIOServer(port, options);
    }
}
