import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    // Si no está logueado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si está logueado pero no tiene el rol, mandarlo a su respectivo inicio
    if (role === 'Administrador') {
        return <Navigate to="/admin/inicio" replace />;
    } else {
        return <Navigate to="/cliente/inicio" replace />;
    }
  }

  // Renderizar la ruta protegida si está ok
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
