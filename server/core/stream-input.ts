import net from 'net';
import fs from 'fs';
// import path from 'path';

let counter = 0;
class UnixStream {
  url: string;

  constructor(stream, onSocket) {
    const sockPath = `output/${++counter}.sock`;
    this.url = 'unix:' + sockPath;

    try {
      fs.statSync(sockPath);
      fs.unlinkSync(sockPath);
    } catch (err) {}
    const server = net.createServer(onSocket);
    stream.on('error', console.error)
    stream.on('finish', () => {
      server.close();
    });
    server.listen(sockPath);
  }
}

export function StreamInput(stream) {
  return new UnixStream(stream, (socket) => stream.pipe(socket));
}

export function StreamOutput(stream) {
  return new UnixStream(stream, (socket) => socket.pipe(stream));
}
