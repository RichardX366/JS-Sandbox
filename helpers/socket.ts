import io, { Socket } from 'socket.io-client';
const { get } = require('axios');

const prom = new Promise<Socket>(async (resolve) => {
  get('/api/socket.io')
    .catch(() => {})
    .finally(() => {
      const socket = io('', { path: '/io/' });
      socket.on('connect', () => resolve(socket));
    });
});

export default prom;
