import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socketInstance = null;

export const connectSocket = (userId, userRole) => {
  if (socketInstance?.connected) {
    return socketInstance;
  }
  socketInstance = io(SOCKET_URL, {
    query: { userId, userRole },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  return socketInstance;
};

export const connectRepartidorSocket = (repartidorId) => {
  if (socketInstance?.connected) {
    return socketInstance;
  }
  socketInstance = io(SOCKET_URL, {
    query: { repartidorId },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocketInstance = () => socketInstance;