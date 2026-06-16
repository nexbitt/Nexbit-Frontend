/**
 * @file PerfilRepartidor.jsx
 * @description Página de perfil para el rol Repartidor.
 * Permite editar datos personales relevantes: nombre, email, teléfono, dirección y contraseña.
 * Basada en Perfil.jsx pero adaptada al contexto del repartidor.
 */
import { useState, useEffect } from 'react';
import api from '../../api';
import { UserCircle, Save, Bell, Moon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ToggleRow from '../../components/ToggleRow';

const PerfilRepartidor = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'ok'|'error', texto: string }

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // ── Configuraciones demo ──────────────────────────────────────────────────
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [autenticacionDosPasos, setAutenticacionDosPasos] = useState(false);

  // ── Cargar perfil al montar ───────────────────────────────────────────────
  useEffect(() => {
    if (user?.id_usuario) {
      cargarPerfil();
    } else {
      setLoading(false);
    }
  }, [user]);

  const cargarPerfil = () => {
    setLoading(true);
    api.get(`/api/usuarios/${user.id_usuario}`)
      .then(res => {
        const u = res.data;
        if (u) {
          setNombre(u.nombre || '');
          setEmail(u.email || '');
          setTelefono(u.telefono || '');
          setDireccion(u.direccion || '');
        }
      })
      .catch(err => {
        console.error('Error al cargar perfil del repartidor:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar el perfil. Verifica tu sesión.' });
      })
      .finally(() => setLoading(false));
  };

  // ── Guardar perfil ────────────────────────────────────────────────────────
  const guardarPerfil = async () => {
    if (!user?.id_usuario) return;

    if (!nombre || !email) {
      setMensaje({ tipo: 'error', texto: 'El nombre y el email son obligatorios.' });
      return;
    }

    const datos = {
      nombre,
      email,
      telefono,
      direccion,
      // Solo enviar password si el usuario escribió una nueva
      ...(password ? { password } : {}),
    };

    setSaving(true);
    setMensaje(null);

    try {
      await api.put(`/api/usuarios/${user.id_usuario}`, datos);
      setPassword('');
      setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado con éxito!' });
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const textoError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al actualizar los datos. ¿Estás autenticado?';
      setMensaje({ tipo: 'error', texto: textoError });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner" />
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="main-header">
        <h1>Mi Perfil</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* ── Formulario de edición ─────────────────────────────────────── */}
        <div className="modal-box" style={{
          flex: '1', minWidth: '300px', margin: 0,
          position: 'relative', transform: 'none'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCircle size={24} color="var(--primary)" />
            Datos Personales
          </h2>

          {/* Mensaje de éxito / error */}
          {mensaje && (
            <div style={{
              padding: '0.75rem', borderRadius: '4px', marginTop: '1rem',
              backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
              color: mensaje.tipo === 'ok' ? '#15803d' : '#b91c1c',
              fontSize: '0.9rem'
            }}>
              {mensaje.texto}
            </div>
          )}

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="input-field" style={{ gridColumn: 'span 2' }}>
              <label>Nombre Completo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Nueva Contraseña <small>(Opcional)</small></label>
              <input
                type="password" placeholder="***"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label>Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Dirección</label>
              <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              className="btn-save"
              onClick={guardarPerfil}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {saving
                ? <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> Guardando...</>
                : <><Save size={18} /> Guardar Cambios</>
              }
            </button>
          </div>
        </div>

        {/* ── Configuraciones demo ───────────────────────────────────────── */}
        <div className="modal-box" style={{
          flex: '0.5', minWidth: '300px', margin: 0,
          position: 'relative', transform: 'none', height: 'fit-content'
        }}>
          <h2>Configuración</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ajustes de preferencias de tu cuenta.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <ToggleRow
              Icon={Moon} label="Modo Oscuro" sub="Cambia a un tema oscuro (Ejemplo)"
              value={modoOscuro} onChange={() => setModoOscuro(v => !v)}
            />
            <ToggleRow
              Icon={Bell} label="Notificaciones" sub="Recibe alertas por email"
              value={notificaciones} onChange={() => setNotificaciones(v => !v)}
            />
            <ToggleRow
              Icon={Shield} label="Autenticación 2 Pasos" sub="Mayor seguridad en tu ingreso"
              value={autenticacionDosPasos} onChange={() => setAutenticacionDosPasos(v => !v)}
              noBorder
            />
          </div>
        </div>

      </div>
    </>
  );
};

export default PerfilRepartidor;
