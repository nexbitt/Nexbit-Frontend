import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, logout as authServiceLogout, getUser, clearSession } from '../services/authService';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Al montar, restaurar la sesión validando contra el backend.
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = getUser();
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        // Validar si el token en la cookie sigue siendo válido
        const res = await api.get('/api/usuarios/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Si falla (401), el interceptor ya limpia la sesión, 
        // pero aquí aseguramos el estado local.
        setUser(null);
        setIsAuthenticated(false);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  /**
   * Llamar después de un login exitoso.
   * @param {Object} userData - Datos del usuario devueltos por el backend (sin token).
   */
  const login = (userData) => {
    saveSession(userData);       // Guarda solo datos de UI en localStorage
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();              // Limpia localStorage
    await authServiceLogout();   // Llama al backend para borrar la httpOnly cookie
  };

  // Derivar el rol de forma segura
  const role = user?.rol_nombre || 'Invitado';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};