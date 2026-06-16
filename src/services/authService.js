import axios from 'axios';

// ─── Clave para el usuario en localStorage ────────────────────────────────────
// NOTA: Solo guardamos los datos del usuario (nombre, rol, etc.) para la UI.
// El token JWT vive en una httpOnly cookie administrada por el servidor —
// JavaScript NO puede leerla (protección contra XSS).
const USER_KEY = 'user';

// ─── Helpers de sesión ────────────────────────────────────────────────────────
export const getUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');

export const saveSession = (user) => {
    // Solo guardamos datos del usuario; el token está en la cookie httpOnly del servidor
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem(USER_KEY);
};

export const logout = async () => {
    try {
        // Pedimos al servidor que limpie la httpOnly cookie
        await axios.post('/api/usuarios/logout', {}, { withCredentials: true });
    } catch (_) {
        // Si el servidor no responde, seguimos limpiando el estado local
    } finally {
        clearSession();
        window.location.href = '/login';
    }
};

// ─── Configuración global de Axios ────────────────────────────────────────────
// withCredentials: true → el navegador incluye automáticamente las cookies en cada petición
axios.defaults.withCredentials = true;

// Si el backend responde 401 (token expirado o inválido), cerramos la sesión
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            console.warn('ADVERTENCIA: Token expirado o inválido. Cerrando sesión...');
            await logout();
        }
        return Promise.reject(error);
    }
);
