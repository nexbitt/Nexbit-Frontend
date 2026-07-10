import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Tags, Search, X, Plus } from 'lucide-react';
import CustomDialog from '../components/ui/CustomDialog';
import CategoriaFormModal from '../components/ui/CategoriaFormModal';

const URL_API = "/api/v1/categorias";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const [searchTerm, setSearchTerm] = useState("");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al listar categorias:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { listar(); }, []);

  const abrirRegistro = () => {
    setSelectedCategoria(null);
    setShowModal(true);
  };

  const seleccionarCategoria = (c) => {
    setSelectedCategoria(c);
    setShowModal(true);
  };

  const eliminar = (id) => {
    setDialog({ open: true, type: 'confirm', title: 'Confirmar eliminación', message: '¿Confirmar eliminación de este registro?', onConfirm: () => {
      setDialog({ open: false, type: 'confirm', title: '', message: '', onConfirm: null });
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          setDialog({ open: true, type: 'error', title: 'Error al eliminar', message: "No se puede eliminar la categoría. Es posible que tenga productos asociados.\nDetalle: " + (err.response?.data?.error || err.message), onConfirm: null });
        });
    }});
  };

  const filteredCategorias = categorias.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (c.nombre && c.nombre.toLowerCase().includes(term))
        || (c.descripcion && c.descripcion.toLowerCase().includes(term));
  });

  const displayItems = filteredCategorias;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 12px', boxSizing: 'border-box' }}>
          <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o descripción..." style={{ border: 'none', outline: 'none', flex: 1, padding: '0 8px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', width: '100%' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} color="#9CA3AF" /></button>}
        </div>
        <button onClick={abrirRegistro} style={{ height: '42px', padding: '0 24px', borderRadius: '9999px', border: 'none', background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
          <Plus size={16} /> Añadir Categoría
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Tags size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay categorías registradas</h2>
            <p>Haz clic en "Registrar Categoría" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Categoría</th>
                <th>Descripción</th>
                <th>Atributos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((c) => (
                <tr key={c.id_categoria}>
                  <td>{c.id_categoria}</td>
                  <td>{c.nombre}</td>
                  <td>{c.descripcion_texto || c.descripcion || ''}</td>
                  <td>
                    {c.atributos && c.atributos.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.atributos.map((a, i) => (
                          <span key={i} style={{
                            display: 'inline-block', padding: '2px 8px', background: '#F3F4F6',
                            borderRadius: '12px', fontSize: '11px', border: '1px solid #E5E7EB',
                            color: '#374151'
                          }}>
                            {a.nombre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarCategoria(c)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(c.id_categoria)}>
                      <Trash2 size={18} color="var(--danger)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {displayItems.length > 20 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          {displayItems.length} registros en total
        </div>
      )}

      <CategoriaFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedCategoria(null); }}
        onSuccess={listar}
        categoria={selectedCategoria}
      />

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

export default Categorias;
