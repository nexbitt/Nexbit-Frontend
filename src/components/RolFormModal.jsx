import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api';
import { useModalScroll } from '../hooks/useModalScroll';
import CustomDialog from './CustomDialog';

const INPUT_STYLE = {
  width: '100%', height: '42px', padding: '0 12px 0 38px',
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: '8px', fontSize: '13px', color: '#111827',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
};

const LABEL_STYLE = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' };
const ICON_LEFT = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' };
const INPUT_WRAPPER = { position: 'relative' };

const RolFormModal = ({ open, onClose, onSuccess, rol }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const isEdit = !!rol;
  const firstInput = useRef(null);

  useModalScroll(open);

  useEffect(() => {
    if (!open) return;
    if (firstInput.current) setTimeout(() => firstInput.current.focus(), 100);
    if (rol) {
      setNombre(rol.nombre || '');
      setDescripcion(rol.descripcion || '');
      setActivo(rol.activo !== undefined ? rol.activo : true);
    } else {
      setNombre(''); setDescripcion(''); setActivo(true);
    }
  }, [open, rol]);

  const handleNombreChange = (e) => {
    setNombre(e.target.value.toUpperCase());
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setDialog({ open: true, type: 'validation', title: 'Campo requerido', message: 'El nombre del rol es obligatorio.', onConfirm: null });
      return;
    }
    if (!descripcion.trim()) {
      setDialog({ open: true, type: 'validation', title: 'Campo requerido', message: 'La descripción operativa del rol es obligatoria.', onConfirm: null });
      return;
    }
    setSubmitting(true);
    const data = { nombre: nombre.trim(), descripcion: descripcion.trim(), activo };

    try {
      if (isEdit) {
        await api.put(`/api/roles/${rol.id_rol}`, data);
      } else {
        await api.post('/api/roles', data);
      }
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: `Rol ${isEdit ? 'actualizado' : 'creado'} correctamente.`, onConfirm: () => {
        setDialog(prev => ({ ...prev, open: false }));
        if (onSuccess) onSuccess();
        onClose();
      }});
    } catch (err) {
      const msg = (err.response?.data?.message || err.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setDialog({ open: true, type: 'error', title: 'Error', message: 'El nombre del rol ya se encuentra registrado en el sistema.', onConfirm: null });
      } else {
        setDialog({ open: true, type: 'error', title: 'Error', message: `No se pudo guardar: ${err.response?.data?.message || err.message}`, onConfirm: null });
      }
    } finally { setSubmitting(false); }
  };

  const handleClose = () => { onClose(); };

  const handleFocus = e => { e.target.style.borderColor = '#111827'; };
  const handleBlur = e => { e.target.style.borderColor = '#E5E7EB'; };

  if (!open) return null;

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)', zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }} onClick={handleClose}>
        <div style={{
          background: '#fff', borderRadius: '16px', width: '450px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '24px 28px 0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {isEdit ? 'Actualizar Rol' : 'Nuevo Rol'}
            </h2>
          </div>

          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={LABEL_STYLE}>Nombre del Rol *</label>
              <div style={INPUT_WRAPPER}>
                <ShieldCheck size={14} style={ICON_LEFT} />
                <input
                ref={firstInput}
                value={nombre}
                onChange={handleNombreChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={INPUT_STYLE}
                placeholder="EJ: ADMINISTRADOR"
              />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Descripción Operativa *</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Describa el alcance y permisos del rol..."
                style={{
                  width: '100%', height: '90px', padding: '10px 12px',
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  borderRadius: '8px', fontSize: '13px', color: '#111827',
                  outline: 'none', boxSizing: 'border-box', resize: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={handleFocus}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Estado del Rol</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setActivo(!activo)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                    background: activo ? '#111827' : '#D1D5DB', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s', padding: 0
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '2px', width: '20px', height: '20px',
                    borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s', left: activo ? '22px' : '2px'
                  }} />
                </button>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                  {activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={handleClose} style={{
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

export default RolFormModal;
