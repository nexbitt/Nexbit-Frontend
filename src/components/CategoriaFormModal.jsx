import { useState, useEffect, useRef } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import api from '../api';
import { useModalScroll } from '../hooks/useModalScroll';
import CustomDialog from './CustomDialog';

const INPUT_STYLE = {
  width: '100%', height: '42px', padding: '0 12px 0 38px',
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: '8px', fontSize: '13px', color: '#111827',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
};

const TEXTAREA_STYLE = {
  width: '100%', height: '75px', padding: '10px 12px',
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: '8px', fontSize: '13px', color: '#111827',
  outline: 'none', boxSizing: 'border-box', resize: 'none',
  fontFamily: 'inherit'
};

const SELECT_STYLE = {
  ...INPUT_STYLE, padding: '0 12px', cursor: 'pointer',
  appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
};

const LABEL_STYLE = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' };
const ICON_LEFT = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' };
const INPUT_WRAPPER = { position: 'relative' };

const CategoriaFormModal = ({ open, onClose, onSuccess, categoria }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const isEdit = !!categoria;
  const nameInputRef = useRef(null);

  useModalScroll(open);

  useEffect(() => {
    if (!open) return;
    if (nameInputRef.current) setTimeout(() => nameInputRef.current.focus(), 100);
    if (categoria) {
      setNombre(categoria.nombre || '');
      setDescripcion(categoria.descripcion || '');
      setActivo(categoria.activo !== undefined ? (categoria.activo ? 1 : 0) : 1);
    } else {
      setNombre(''); setDescripcion(''); setActivo(1);
    }
  }, [open, categoria]);

  const handleSubmit = async () => {
    const trimmed = nombre.trim();
    if (!trimmed) {
      setDialog({ open: true, type: 'validation', title: 'Campo requerido', message: 'El nombre de la categoría es obligatorio.', onConfirm: null });
      return;
    }
    setSubmitting(true);
    const data = { nombre: trimmed, descripcion: descripcion.trim(), activo: activo === 1 };

    try {
      if (isEdit) {
        await api.put(`/api/categorias/${categoria.id_categoria}`, data);
      } else {
        await api.post('/api/categorias', data);
      }
      setNombre(''); setDescripcion(''); setActivo(1);
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: `Categoría ${isEdit ? 'actualizada' : 'creada'} correctamente.`, onConfirm: () => {
        setDialog(prev => ({ ...prev, open: false }));
        if (onSuccess) onSuccess();
        onClose();
      }});
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes('duplicate') || msg?.toLowerCase().includes('unique') || msg?.toLowerCase().includes('ya existe')) {
        setDialog({ open: true, type: 'error', title: 'Error', message: 'El nombre ingresado ya se encuentra registrado en el sistema.', onConfirm: null });
      } else {
        setDialog({ open: true, type: 'error', title: 'Error', message: `No se pudo guardar: ${msg}`, onConfirm: null });
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
          background: '#fff', borderRadius: '16px', width: '450px',
          maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '24px 28px 0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {isEdit ? 'Actualizar Categoría' : 'Nueva Categoría'}
            </h2>
          </div>

          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={LABEL_STYLE}>Nombre de Categoría *</label>
              <div style={INPUT_WRAPPER}>
                <Tag size={14} style={ICON_LEFT} />
                <input
                ref={nameInputRef}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={INPUT_STYLE}
                placeholder="Escribe el nombre..."
              />
              </div>
            </div>

            <div>
              <label style={LABEL_STYLE}>Descripción de la Categoría</label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Escribe una breve nota explicativa..."
                style={TEXTAREA_STYLE}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Estado Operativo</label>
              <select
                value={activo}
                onChange={e => setActivo(Number(e.target.value))}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={SELECT_STYLE}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={onClose} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: '1px solid #D1D5DB',
              background: '#fff', color: '#111827', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: 'none',
              background: submitting ? '#6B7280' : '#111827', color: '#fff', fontSize: '13px',
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
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

export default CategoriaFormModal;
