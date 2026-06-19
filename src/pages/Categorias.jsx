import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Tags } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CustomDialog from '../components/CustomDialog';
import CategoriaFormModal from '../components/CategoriaFormModal';

const URL_API = "/api/categorias";

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
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Categoría</button>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o descripción..."
        />
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((c) => (
                <tr key={c.id_categoria}>
                  <td>{c.id_categoria}</td>
                  <td>{c.nombre}</td>
                  <td>{c.descripcion}</td>
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
