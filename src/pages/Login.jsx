/**
 * @file Login.jsx
 * @description Página de inicio de sesión.
 *
 * CORRECCIONES APLICADAS:
 *  BUG #2 — Flujo de Login: Se añade un enlace funcional "Volver al Inicio"
 *     que navega a /usuario/inicio sin necesidad de autenticación.
 *     El router NO bloquea esa ruta porque /usuario/* es pública (sin ProtectedRoute).
 */
import { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const URL_LOGIN = "/api/usuarios/login";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // ── Manejador del submit ────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(URL_LOGIN, { email, password });
      const userData = response.data.user;

      // login() guarda los datos del usuario en el contexto y en localStorage.
      // El token ya vive en la httpOnly cookie → el navegador lo manda solo.
      login(userData);

      // Redirigir según el rol del usuario
      const rolNombre = userData?.rol_nombre || '';
      if (rolNombre === 'Administrador') {
        navigate('/admin/inicio', { replace: true });
      } else if (rolNombre === 'Repartidor') {
        navigate('/repartidor/inicio', { replace: true });
      } else {
        navigate('/cliente/inicio', { replace: true });
      }

    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (status === 403) {
        setError('Tu cuenta está inactiva. Contacta al administrador.');
      } else {
        setError(err.response?.data?.message || 'Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', backgroundColor: 'var(--bg-dark)',
      padding: '1rem'
    }}>

      {/* ── Botón VOLVER AL INICIO ── CORRECCIÓN #2 ──────────────────────── */}
      {/*
        ¿Por qué Link y no <button onClick={navigate}>?
        → Link genera un <a> semántico. Es más accesible y funciona aunque
          JavaScript falle en cargar. Navigate() es para navegación imperativa
          (después de una acción como guardar un formulario).
        ¿Por qué /usuario/inicio y no /?
        → La ruta "/" ya hace <Navigate to="/usuario/inicio" replace />.
          Vamos directo para evitar un salto extra.
      */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '0.75rem' }}>
        <Link
          to="/usuario/inicio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none',
          }}
        >
        </Link>
      </div>

      {/* ── Tarjeta de login ─────────────────────────────────────────────── */}
      <div className="modal-box" style={{
        width: '100%', maxWidth: '400px',
        transform: 'none', position: 'relative'
      }}>

        {/* Logo + Título (Cliqueable) */}
        <Link
          to={isAuthenticated ? (role === 'Administrador' ? '/admin/inicio' : '/cliente/inicio') : '/usuario/inicio'}
          style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: '2rem' }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: '0.75rem', cursor: 'pointer' }}>
            <path d="M12 2L2 22H22L12 2Z" fill="var(--primary)" />
          </svg>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: '800',
            letterSpacing: '-0.02em', color: '#0f172a', margin: 0,
            cursor: 'pointer'
          }}>
            Nexbit
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Accede a tu cuenta de RematesPaisa
          </p>
        </Link>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2', color: '#b91c1c',
            padding: '0.75rem', borderRadius: '4px',
            marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin}>
          <div className="input-field" style={{ marginBottom: '1.25rem' }}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: admin@remate.com"
              required
            />
          </div>

          <div className="input-field" style={{ marginBottom: '2rem' }}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="***"
              required
            />
          </div>

          {/* Botón Ingresar */}
          <button
            className="btn-save"
            type="submit"
            style={{
              width: '100%', padding: '0.8rem', fontSize: '1rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              marginBottom: '1rem', cursor: 'pointer', border: 'none',
              borderRadius: '8px', boxSizing: 'border-box'
            }}
            disabled={loading}
          >
            {loading
              ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }} />
              : 'Ingresar'
            }
          </button>

          {/* Enlace a Registro */}
          <Link
            to="/register"
            style={{
              width: '100%', padding: '0.8rem', fontSize: '1rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              backgroundColor: '#f1f5f9', color: '#475569',
              textDecoration: 'none', borderRadius: '8px',
              fontWeight: '600', boxSizing: 'border-box',
              border: '1px solid #e2e8f0'
            }}
          >
            Crear cuenta nueva
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
