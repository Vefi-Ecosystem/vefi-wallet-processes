import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

export default class SocketService {
  static socketIds: Array<string> = [];
  static io: SocketServer;

  static _init(server: HttpServer): void {
    this.io = new SocketServer(server, { cors: { origin: '*' } });
    this.io.on('connection', (socket) => {
      this.socketIds = [...this.socketIds, socket.id];
    });
    this.io.on('disconnect', (socket) => {
      this.socketIds = this.socketIds.filter((id) => id !== socket.id);
    });
  }

  static _emitToAll(event: string, val: any): void {
    for (const id of SocketService.socketIds)
      SocketService.io.to(id).emit(event, typeof val === 'string' ? val : JSON.stringify(val));
  }
}
