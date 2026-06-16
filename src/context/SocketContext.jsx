import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const lastEventRef = useRef(null);
  const toastHandlerRef = useRef(null);

  const registerToastHandler = useCallback((handler) => {
    toastHandlerRef.current = handler;
  }, []);

  const showToast = useCallback((title, message, type) => {
    if (toastHandlerRef.current) {
      toastHandlerRef.current(title, message, type);
    }
  }, []);

  const fetchPendingReviewCount = useCallback(async () => {
    try {
      const res = await api.get('/api/pedidos/en-revision');
      setPendingReviewCount(res.data.length || 0);
    } catch (err) {
      console.error('Error fetching pending review count:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const role = user.rol_nombre || 'Invitado';

    const query = {
      userId: user.id_usuario,
      userRole: role
    };

    const s = io('http://127.0.0.1:3000', {
      query,
      withCredentials: true,
    });

    s.on('connect', () => {
      if (role === 'Administrador') {
        fetchPendingReviewCount();
      }
    });

    if (role === 'Administrador') {
      s.on('notificacion:nuevo-pedido', (data) => {
        showToast(data.titulo, data.mensaje, 'new-order');
        lastEventRef.current = { type: 'nuevo-pedido', ...data };
        setPendingReviewCount(prev => prev + 1);
      });

      s.on('notificacion:nuevo-comprobante', (data) => {
        showToast(data.titulo, data.mensaje, 'review');
        lastEventRef.current = { type: 'nuevo-comprobante', ...data };
        fetchPendingReviewCount();
      });
    }

    if (role === 'Repartidor') {
      s.on('pedido:disponible-nuevo', (data) => {
        showToast('Nuevo pedido disponible', 'Hay un nuevo pedido disponible para tomar.', 'new-order');
        lastEventRef.current = { type: 'nuevo-disponible', ...(data || {}) };
      });
    }

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{
      socket,
      pendingReviewCount,
      setPendingReviewCount,
      lastEvent: lastEventRef,
      registerToastHandler,
      fetchPendingReviewCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
