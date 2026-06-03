import { io } from 'socket.io-client';

const getSocket = (repartidorId) => {
  const socket = io('http://localhost:3000', {
    query: { repartidorId },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  return socket;
};

let socketInstance = null;

export const connectSocket = (repartidorId) => {
  if (socketInstance?.connected) {
    return socketInstance;
  }
  socketInstance = getSocket(repartidorId);
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocketInstance = () => socketInstance;
