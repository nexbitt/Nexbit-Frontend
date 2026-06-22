import { useState, useEffect, useRef } from 'react';
import { Fingerprint, ShieldCheck, User, IdCard, Mail, Lock, Eye, EyeOff, ToggleRight, Loader2 } from 'lucide-react';
import api from '../../api';
import { useModalScroll } from '../../hooks/useModalScroll';
import CustomDialog from './CustomDialog';

const INPUT_STYLE = {
  width: '100%', height: '42px', padding: '0 12px 0 38px',
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: '8px', fontSize: '13px', color: '#111827',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
};

const INPUT_DISABLED_STYLE = {
  ...INPUT_STYLE, background: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed'
};

const LABEL_STYLE = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' };
const ICON_LEFT = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' };
const INPUT_WRAPPER = { position: 'relative' };

const SELECT_STYLE = {
  ...INPUT_STYLE, padding: '0 12px', cursor: 'pointer',
  appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UsuarioFormModal = ({ open, onClose, onSuccess, usuario, rolesList }) => {
  const [idUsuario, setIdUsuario] = useState(null);
  const [rolId, setRolId] = useState('');
  const [nombre, setNombre] = useState('');
  const [numDoc, setNumDoc] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const isEdit = !!usuario;
  const firstInput = useRef(null);

  useModalScroll(open);

  useEffect(() => {
    if (!open) return;
    if (firstInput.current) setTimeout(() => firstInput.current.focus(), 100);
    if (usuario) {
      setIdUsuario(usuario.id_usuario);
      setRolId(usuario.rol_id);
      setNombre(usuario.nombre || '');
      setNumDoc(usuario.numero_documento || '');
      setEmail(usuario.email || '');
      setPassword('');
      setActivo(usuario.activo);
    } else {
      setIdUsuario(null);
      setRolId(rolesList.length > 0 ? rolesList[0].id_rol : 1);
      setNombre(''); setNumDoc(''); setEmail(''); setPassword(''); setActivo(1);
    }
    setShowPassword(false);
  }, [open, usuario, rolesList]);

  const validate = () => {
    if (!nombre.trim()) return 'Por favor, ingrese el nombre, correo y credenciales requeridas.';
    if (!email.trim()) return 'Por favor, ingrese el nombre, correo y credenciales requeridas.';
    if (!isEdit && !password.trim()) return 'Por favor, ingrese el nombre, correo y credenciales requeridas.';
    if (!EMAIL_REGEX.test(email.trim())) return 'El formato del correo electrónico no es válido.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setDialog({ open: true, type: 'validation', title: 'Campos incompletos', message: err, onConfirm: null });
      return;
    }
    setSubmitting(true);
    const data = { rol_id: rolId, nombre: nombre.trim(), email: email.trim(), numero_documento: numDoc.trim(), activo };
    if (!isEdit) data.password = password;

    try {
      if (isEdit) {
        await api.put(`/api/usuarios/${usuario.id_usuario}`, data);
      } else {
        await api.post('/api/usuarios', data);
      }
      setDialog({
        open: true, type: 'success', title: 'Operación exitosa',
        message: 'Usuario registrado correctamente en el sistema.',
        onConfirm: () => {
          setDialog(prev => ({ ...prev, open: false }));
          if (onSuccess) onSuccess();
          onClose();
        }
      });
    } catch (err) {
      const msg = (err.response?.data?.message || err.message || '').toLowerCase();
      if (msg.includes('email') || msg.includes('correo') || msg.includes('unique')) {
        setDialog({
          open: true, type: 'error', title: 'Error de restricción',
          message: 'El correo electrónico ingresado ya se encuentra asignado a otra cuenta activa.',
          onConfirm: null
        });
      } else {
        setDialog({
          open: true, type: 'error', title: 'Error al guardar',
          message: `No se pudo guardar: ${err.response?.data?.message || err.message}`,
          onConfirm: null
        });
      }
    } finally { setSubmitting(false); }
  };

  const handleFocus = e => { e.target.style.borderColor = '#111827'; };
  const handleBlur = e => { e.target.style.borderColor = '#E5E7EB'; };

  if (!open) return null;

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)', zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: '#fff', borderRadius: '16px', width: '850px', maxWidth: '100%',
          maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '24px 28px 0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {isEdit ? 'Actualizar Usuario' : 'Nuevo Registro'}
            </h2>
          </div>

          <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
            {/* COL A: IDENTIFICACIÓN Y PERFIL DE ACCESO */}
            <div>
              <label style={LABEL_STYLE}>ID del Registro</label>
              <div style={INPUT_WRAPPER}>
                <Fingerprint size={14} style={ICON_LEFT} />
                <input value={idUsuario || ''} disabled style={INPUT_DISABLED_STYLE} />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Rol de Acceso *</label>
              <div style={INPUT_WRAPPER}>
                <ShieldCheck size={14} style={ICON_LEFT} />
                <select value={rolId} onChange={e => setRolId(Number(e.target.value))} onFocus={handleFocus} onBlur={handleBlur} style={SELECT_STYLE}>
                  <option value="" disabled>Seleccione un rol...</option>
                  {rolesList.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Nombre Completo *</label>
              <div style={INPUT_WRAPPER}>
                <User size={14} style={ICON_LEFT} />
                <input ref={firstInput} value={nombre} onChange={e => setNombre(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={INPUT_STYLE} placeholder="Ej: Juan Pérez..." />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Número de Documento *</label>
              <div style={INPUT_WRAPPER}>
                <IdCard size={14} style={ICON_LEFT} />
                <input value={numDoc} onChange={e => setNumDoc(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={INPUT_STYLE} placeholder="1234567890" />
              </div>
            </div>

            {/* COL B: CREDENCIALES Y ESTADO */}
            <div>
              <label style={LABEL_STYLE}>Correo Electrónico *</label>
              <div style={INPUT_WRAPPER}>
                <Mail size={14} style={ICON_LEFT} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={INPUT_STYLE} placeholder="ej: correo@dominio.com" />
              </div>
            </div>
            {!isEdit && (
              <div>
                <label style={LABEL_STYLE}>Contraseña de Acceso *</label>
                <div style={INPUT_WRAPPER}>
                  <Lock size={14} style={ICON_LEFT} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ ...INPUT_STYLE, paddingRight: '40px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0,
                      color: '#9CA3AF', display: 'flex', alignItems: 'center'
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <label style={LABEL_STYLE}>Estado de la Cuenta *</label>
              <div style={INPUT_WRAPPER}>
                <ToggleRight size={14} style={ICON_LEFT} />
                <select value={activo} onChange={e => setActivo(Number(e.target.value))} onFocus={handleFocus} onBlur={handleBlur} style={SELECT_STYLE}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={onClose} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: '1px solid #D1D5DB',
              background: '#fff', color: '#111827', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
            }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: 'none',
              background: submitting ? '#6B7280' : '#111827', color: '#fff', fontSize: '13px',
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {submitting && <Loader2 size={16} style={{ animation: 'admin-spin 1s linear infinite' }} />}
              {isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      <CustomDialog
        type={dialog.type}
        open={dialog.open}
        onClose={() => setDialog(prev => ({ ...prev, open: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
      />
    </>
  );
};

export default UsuarioFormModal;
