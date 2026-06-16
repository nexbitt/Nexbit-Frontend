import { useState, useEffect } from 'react';
import api from '../api';
import {
  UserCircle, Save, Bell, Moon, Shield, Trash2,
  Download, AlertTriangle, X, Clock, Package, FileText,
  Smartphone, Key, RotateCcw, Pencil, Lock, Eye, EyeOff,
  CheckCircle, Mail, Phone, MapPin, FileDigit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ToggleRow from '../components/ToggleRow';
import { useModalScroll } from '../hooks/useModalScroll';

const URL_API = "/api/pedidos";

const TABS = [
  { id: 'datos', label: 'Datos Personales', icon: UserCircle },
  { id: 'basurero', label: 'Papelera', icon: Trash2 },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'config', label: 'Configuración', icon: Bell },
];

const ORDER_STATUS_LABELS = {
  PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado', RECHAZADO: 'Rechazado', ASIGNADO: 'Asignado',
  EN_CAMINO: 'En camino', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado', DISPONIBLE: 'Disponible',
};

const ORDER_STATUS_COLORS = {
  PENDIENTE: { bg: '#fef9c3', color: '#854d0e' }, CONFIRMADO: { bg: '#ecfdf5', color: '#065f46' },
  EN_REVISION: { bg: '#fff7ed', color: '#c2410c' }, APROBADO: { bg: '#f0fdf4', color: '#166534' },
  RECHAZADO: { bg: '#fef2f2', color: '#991b1b' }, ASIGNADO: { bg: '#eff6ff', color: '#1e40af' },
  EN_CAMINO: { bg: '#eef2ff', color: '#4338ca' }, ENTREGADO: { bg: '#ecfdf5', color: '#065f46' },
  CANCELADO: { bg: '#fef2f2', color: '#b91c1c' }, DISPONIBLE: { bg: '#f0fdfa', color: '#115e59' },
};

const Perfil = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('datos');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  // Datos personales
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipoDoc, setTipoDoc] = useState('');
  const [numDoc, setNumDoc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [userRole, setUserRole] = useState('');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form edit copy (to allow cancel)
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTipoDoc, setEditTipoDoc] = useState('');
  const [editNumDoc, setEditNumDoc] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');

  // Demo settings
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [autenticacionDosPasos, setAutenticacionDosPasos] = useState(false);

  // Basurero
  const [trashOrders, setTrashOrders] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);

  // Demo modals
  const [showDemoModal, setShowDemoModal] = useState(null);

  useModalScroll(showPasswordModal || showDemoModal);

  useEffect(() => {
    if (user?.id_usuario) {
      cargarPerfil();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'basurero' && user?.id_usuario) {
      cargarTrash();
    }
  }, [activeTab]);

  const cargarPerfil = () => {
    setLoading(true);
    api.get(`/api/usuarios/${user.id_usuario}`)
      .then(res => {
        const u = res.data;
        if (u) {
          setNombre(u.nombre);
          setEmail(u.email);
          setTipoDoc(u.tipo_documento || '');
          setNumDoc(u.numero_documento || '');
          setTelefono(u.telefono || '');
          setDireccion(u.direccion || '');
          setUserRole(u.rol_nombre || '');
        }
      })
      .catch(err => {
        console.error('Error al cargar perfil:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar el perfil. Verifica tu sesión.' });
      })
      .finally(() => setLoading(false));
  };

  const abrirModalPassword = () => {
    setCurrentPassword('');
    setPasswordError('');
    setPasswordLoading(false);
    setPasswordVerified(false);
    setShowPasswordModal(true);
  };

  const verificarPassword = async () => {
    if (!currentPassword) {
      setPasswordError('Debes ingresar tu contraseña actual');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const res = await api.post('/api/usuarios/verificar-contrasena', { password: currentPassword });
      if (res.data.valida) {
        setPasswordVerified(true);
        setEditNombre(nombre);
        setEditEmail(email);
        setEditTipoDoc(tipoDoc);
        setEditNumDoc(numDoc);
        setEditTelefono(telefono);
        setEditDireccion(direccion);
        setEditNewPassword('');
        setIsEditing(true);
        setShowPasswordModal(false);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Contraseña incorrecta');
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setIsEditing(false);
    setPasswordVerified(false);
    setCurrentPassword('');
  };

  const guardarPerfil = async () => {
    if (!user?.id_usuario) return;
    if (!editNombre || !editEmail) {
      setMensaje({ tipo: 'error', texto: 'El nombre y el email son obligatorios.' });
      return;
    }
    const datos = {
      current_password: currentPassword,
      nombre: editNombre,
      email: editEmail,
      tipo_documento: editTipoDoc,
      numero_documento: editNumDoc,
      telefono: editTelefono,
      direccion: editDireccion,
      ...(editNewPassword ? { password: editNewPassword } : {}),
      activo: 1
    };
    setSaving(true);
    setMensaje(null);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}`, datos);
      setNombre(editNombre);
      setEmail(editEmail);
      setTipoDoc(editTipoDoc);
      setNumDoc(editNumDoc);
      setTelefono(editTelefono);
      setDireccion(editDireccion);
      setEditNewPassword('');
      setCurrentPassword('');
      setIsEditing(false);
      setPasswordVerified(false);
      setMensaje({ tipo: 'ok', texto: 'Perfil actualizado con éxito' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al actualizar';
      setMensaje({ tipo: 'error', texto: errMsg });
      if (errMsg.includes('Contraseña')) {
        setPasswordVerified(false);
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const cargarTrash = async () => {
    setTrashLoading(true);
    try {
      const res = await api.get(`${URL_API}/usuario/trash`);
      setTrashOrders(res.data);
    } catch (err) {
      console.error('Error al cargar papelera:', err);
    } finally {
      setTrashLoading(false);
    }
  };

  const restaurarPedido = async (id) => {
    setRestoring(id);
    try {
      await api.put(`${URL_API}/${id}/restaurar`);
      setTrashOrders(prev => prev.filter(p => p.id_pedido !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al restaurar');
    } finally {
      setRestoring(null);
    }
  };

  const handleDemoClick = (feature) => {
    setShowDemoModal(feature);
  };

  const renderMensaje = () => {
    if (!mensaje) return null;
    return (
      <div style={{
        padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
        backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
        color: mensaje.tipo === 'ok' ? '#15803d' : '#b91c1c',
        fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        {mensaje.tipo === 'ok' ? '✓' : '✗'} {mensaje.texto}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem' }}>Cargando información...</p>
      </div>
    );
  }

  return (
    <>
      <header className="main-header">
        <h1>Mi Cuenta</h1>
      </header>

      <div className="perfil-layout">
        <div className="perfil-sidebar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`perfil-tab ${activeTab === tab.id ? 'perfil-tab--active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.id === 'basurero' && trashOrders.length > 0 && (
                  <span className="perfil-badge">{trashOrders.length}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="perfil-content">
          {activeTab === 'datos' && (
            <div className="perfil-card">
              <div className="perfil-card-header">
                <UserCircle size={22} />
                <h2>Información Personal</h2>
                {!isEditing && (
                  <button className="perfil-edit-btn" onClick={abrirModalPassword}>
                    <Pencil size={15} /> Editar
                  </button>
                )}
              </div>
              <p className="perfil-card-sub">
                {isEditing
                  ? 'Modifica los datos que deseas actualizar y guarda los cambios.'
                  : 'Revisa tu información personal. Para modificarla, haz clic en "Editar".'}
              </p>

              {renderMensaje()}

              {!isEditing ? (
                <div className="perfil-readonly">
                  <div className="perfil-readonly-row">
                    <div className="perfil-readonly-icon"><UserCircle size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Nombre Completo</span>
                      <span className="perfil-readonly-value">{nombre}</span>
                    </div>
                  </div>
                  <div className="perfil-readonly-row">
                    <div className="perfil-readonly-icon"><Mail size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Correo Electrónico</span>
                      <span className="perfil-readonly-value">{email}</span>
                    </div>
                  </div>
                  <div className="perfil-readonly-row">
                    <div className="perfil-readonly-icon"><FileDigit size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Documento</span>
                      <span className="perfil-readonly-value">
                        {tipoDoc && numDoc ? `${tipoDoc} ${numDoc}` : 'No registrado'}
                      </span>
                    </div>
                  </div>
                  <div className="perfil-readonly-row">
                    <div className="perfil-readonly-icon"><Phone size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Teléfono</span>
                      <span className="perfil-readonly-value">{telefono || 'No registrado'}</span>
                    </div>
                  </div>
                  <div className="perfil-readonly-row">
                    <div className="perfil-readonly-icon"><MapPin size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Dirección</span>
                      <span className="perfil-readonly-value">{direccion || 'No registrada'}</span>
                    </div>
                  </div>
                  <div className="perfil-readonly-row perfil-readonly-row--last">
                    <div className="perfil-readonly-icon"><Shield size={18} /></div>
                    <div className="perfil-readonly-info">
                      <span className="perfil-readonly-label">Rol</span>
                      <span className="perfil-readonly-value perfil-readonly-value--role">{userRole}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="perfil-form-grid">
                  <div className="perfil-field perfil-field-full">
                    <label>Nombre Completo</label>
                    <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Tu nombre" />
                  </div>
                  <div className="perfil-field">
                    <label>Correo Electrónico</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="perfil-field">
                    <label>Nueva Contraseña <span className="perfil-optional">(opcional)</span></label>
                    <input type="password" value={editNewPassword} onChange={e => setEditNewPassword(e.target.value)} placeholder="Dejar vacío para mantener" />
                  </div>
                  <div className="perfil-field">
                    <label>Tipo de Documento</label>
                    <select value={editTipoDoc} onChange={e => setEditTipoDoc(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="CC">CC - Cédula de Ciudadanía</option>
                      <option value="CE">CE - Cédula de Extranjería</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div className="perfil-field">
                    <label>Número de Documento</label>
                    <input value={editNumDoc} onChange={e => setEditNumDoc(e.target.value)} placeholder="1234567890" />
                  </div>
                  <div className="perfil-field">
                    <label>Teléfono</label>
                    <input value={editTelefono} onChange={e => setEditTelefono(e.target.value)} placeholder="+57 300 123 4567" />
                  </div>
                  <div className="perfil-field perfil-field-full">
                    <label>Dirección</label>
                    <input value={editDireccion} onChange={e => setEditDireccion(e.target.value)} placeholder="Calle 123 #45-67" />
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="perfil-actions">
                  <button className="btn-cancel" onClick={cancelarEdicion}
                    style={{ marginRight: '0.75rem' }}>
                    Cancelar
                  </button>
                  <button className="btn-save" onClick={guardarPerfil} disabled={saving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {saving
                      ? <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> Guardando...</>
                      : <><Save size={18} /> Guardar Cambios</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'basurero' && (
            <div className="perfil-card">
              <div className="perfil-card-header">
                <Trash2 size={22} />
                <h2>Papelera de Pedidos</h2>
              </div>
              <p className="perfil-card-sub">
                Los pedidos que elimines desde la pantalla principal aparecerán aquí.
                Puedes restaurarlos en cualquier momento.
              </p>

              {trashLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div className="spinner" />
                  <p style={{ marginTop: '1rem' }}>Cargando papelera...</p>
                </div>
              ) : trashOrders.length === 0 ? (
                <div className="perfil-empty">
                  <Trash2 size={48} color="#cbd5e1" />
                  <h3>Papelera vacía</h3>
                  <p>No hay pedidos eliminados. Cuando borres un pedido, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="perfil-trash-list">
                  {trashOrders.map(p => {
                    const colors = ORDER_STATUS_COLORS[p.estado] || ORDER_STATUS_COLORS.PENDIENTE;
                    return (
                      <div key={p.id_pedido} className="perfil-trash-item">
                        <div className="perfil-trash-item-header">
                          <span className="perfil-trash-id">Pedido #{p.id_pedido}</span>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                            background: colors.bg, color: colors.color
                          }}>
                            {ORDER_STATUS_LABELS[p.estado] || p.estado}
                          </span>
                        </div>
                        <div className="perfil-trash-item-body">
                          <div className="perfil-trash-info">
                            <Clock size={14} />
                            <span>{new Date(p.fecha_pedido || p.fecha).toLocaleDateString()}</span>
                          </div>
                          <div className="perfil-trash-info">
                            <Package size={14} />
                            <span>Total: <strong>${Number(p.total).toLocaleString()}</strong></span>
                          </div>
                        </div>
                        <div className="perfil-trash-item-actions">
                          <button
                            className="btn-order-action"
                            onClick={() => restaurarPedido(p.id_pedido)}
                            disabled={restoring === p.id_pedido}
                            style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                          >
                            {restoring === p.id_pedido ? (
                              <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Restaurando...</>
                            ) : (
                              <><RotateCcw size={15} /> Restaurar</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="perfil-card">
              <div className="perfil-card-header">
                <Shield size={22} />
                <h2>Seguridad</h2>
              </div>
              <p className="perfil-card-sub">Configura la seguridad de tu cuenta.</p>

              <div className="perfil-demo-features">
                <div className="perfil-demo-item" onClick={() => handleDemoClick('2fa')}>
                  <div className="perfil-demo-icon">
                    <Shield size={24} />
                  </div>
                  <div className="perfil-demo-info">
                    <h4>Autenticación de Dos Factores</h4>
                    <p>Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <button className="perfil-demo-btn">Configurar</button>
                </div>

                <div className="perfil-demo-item" onClick={() => handleDemoClick('password')}>
                  <div className="perfil-demo-icon">
                    <Key size={24} />
                  </div>
                  <div className="perfil-demo-info">
                    <h4>Cambiar Contraseña</h4>
                    <p>Actualiza tu contraseña desde "Datos Personales"</p>
                  </div>
                  <button className="perfil-demo-btn">Ir</button>
                </div>

                <div className="perfil-demo-item" onClick={() => handleDemoClick('sessions')}>
                  <div className="perfil-demo-icon">
                    <Smartphone size={24} />
                  </div>
                  <div className="perfil-demo-info">
                    <h4>Dispositivos Conectados</h4>
                    <p>Gestiona los dispositivos con acceso a tu cuenta</p>
                  </div>
                  <button className="perfil-demo-btn">Ver</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="perfil-card">
              <div className="perfil-card-header">
                <Bell size={22} />
                <h2>Preferencias</h2>
              </div>
              <p className="perfil-card-sub">Personaliza tu experiencia en Nexbit.</p>

              <div className="perfil-toggles">
                <ToggleRow
                  Icon={Moon} label="Modo Oscuro" sub="Cambia a un tema oscuro"
                  value={modoOscuro} onChange={() => setModoOscuro(v => !v)}
                />
                <ToggleRow
                  Icon={Bell} label="Notificaciones" sub="Recibe alertas de tus pedidos por correo"
                  value={notificaciones} onChange={() => setNotificaciones(v => !v)}
                />
                <ToggleRow
                  Icon={Shield} label="Autenticación 2 Pasos" sub="Mayor seguridad al iniciar sesión"
                  value={autenticacionDosPasos} onChange={() => setAutenticacionDosPasos(v => !v)}
                  noBorder
                />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Funciones Avanzadas (Demo)
                </h3>
                <div className="perfil-demo-features">
                  <div className="perfil-demo-item" onClick={() => handleDemoClick('export')}>
                    <div className="perfil-demo-icon">
                      <Download size={24} />
                    </div>
                    <div className="perfil-demo-info">
                      <h4>Exportar Historial</h4>
                      <p>Descarga tu historial de pedidos en formato CSV o PDF</p>
                    </div>
                    <button className="perfil-demo-btn">
                      <Download size={14} /> Exportar
                    </button>
                  </div>

                  <div className="perfil-demo-item" onClick={() => handleDemoClick('alerts')}>
                    <div className="perfil-demo-icon">
                      <Bell size={24} />
                    </div>
                    <div className="perfil-demo-info">
                      <h4>Alertas de Entrega</h4>
                      <p>Configura notificaciones personalizadas para tus entregas</p>
                    </div>
                    <button className="perfil-demo-btn">Configurar</button>
                  </div>

                  <div className="perfil-demo-item" onClick={() => handleDemoClick('report')}>
                    <div className="perfil-demo-icon">
                      <FileText size={24} />
                    </div>
                    <div className="perfil-demo-info">
                      <h4>Reporte de Actividad</h4>
                      <p>Genera un reporte detallado de tu actividad en la plataforma</p>
                    </div>
                    <button className="perfil-demo-btn">Generar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CONFIRMAR IDENTIDAD ──────────────────────────── */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <Lock size={20} /> Confirmar Identidad
              </h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={22} />
              </button>
            </div>

            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Para editar tus datos personales, ingresa tu contraseña actual para confirmar tu identidad.
            </p>

            <div className="perfil-field" style={{ marginBottom: '1rem' }}>
              <label>Contraseña Actual</label>
              <div className="perfil-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') verificarPassword(); }}
                  placeholder="Ingresa tu contraseña"
                  autoFocus
                />
                <button
                  className="perfil-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem',
                padding: '0.5rem 0.75rem', background: '#fef2f2', borderRadius: '6px'
              }}>
                <AlertTriangle size={14} /> {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
              <button
                className="btn-save"
                onClick={verificarPassword}
                disabled={passwordLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {passwordLoading
                  ? <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> Verificando...</>
                  : <><CheckCircle size={18} /> Confirmar Identidad</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DEMO ─────────────────────────────────────────── */}
      {showDemoModal && (
        <div className="modal-backdrop" onClick={() => setShowDemoModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {showDemoModal === '2fa' && <><Shield size={20} /> Autenticación 2FA</>}
                {showDemoModal === 'password' && <><Key size={20} /> Cambiar Contraseña</>}
                {showDemoModal === 'sessions' && <><Smartphone size={20} /> Dispositivos</>}
                {showDemoModal === 'export' && <><Download size={20} /> Exportar Historial</>}
                {showDemoModal === 'alerts' && <><Bell size={20} /> Alertas de Entrega</>}
                {showDemoModal === 'report' && <><FileText size={20} /> Reporte de Actividad</>}
              </h2>
              <button onClick={() => setShowDemoModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Función en Desarrollo</h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                {showDemoModal === '2fa' && 'La autenticación de dos factores estará disponible próximamente. Te notificaremos cuando esté lista.'}
                {showDemoModal === 'password' && 'Puedes cambiar tu contraseña desde la sección "Datos Personales" con solo hacer clic en "Editar".'}
                {showDemoModal === 'sessions' && 'La gestión de dispositivos conectados estará disponible en una próxima actualización.'}
                {showDemoModal === 'export' && 'La exportación de historial en CSV y PDF estará disponible próximamente. Mientras tanto, puedes descargar tus tickets desde "Mis Pedidos".'}
                {showDemoModal === 'alerts' && 'Las alertas de entrega personalizadas son una función premium que estará disponible en los próximos días.'}
                {showDemoModal === 'report' && 'La generación de reportes de actividad estará disponible en una próxima actualización.'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn-save" onClick={() => setShowDemoModal(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Perfil;
