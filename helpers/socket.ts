import io, { Socket } from 'socket.io-client';

const prom = new Promise<Socket>(async (resolve) => {
  await fetch(
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') +
      '/api/socket.io'
  );
  const socket = io();
  socket.on('connect', () => resolve(socket));
});

export default prom;
