import axios from 'axios';

// Instancia global con credenciales para que la httpOnly cookie viaje en cada request
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// Interceptor: si el backend devuelve 401 (token expirado/inválido),
// limpia la sesión local y redirige al login.
// Excluye rutas públicas (login, register, invitados en /usuario).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    const isPublicRoute = path === '/login'
      || path === '/register'
      || path === '/forgot-password'
      || path.startsWith('/usuario');

    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
