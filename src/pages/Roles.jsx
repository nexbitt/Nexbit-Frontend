import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, ShieldCheck, Plus } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CustomDialog from '../components/CustomDialog';
import RolFormModal from '../components/RolFormModal';

const URL_API = "/api/roles";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const [searchTerm, setSearchTerm] = useState("");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setRoles(res.data))
      .catch(err => console.error("Error al listar roles:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { listar(); }, []);

  const abrirRegistro = () => {
    setSelectedRol(null);
    setShowModal(true);
  };

  const seleccionarRol = (r) => {
    setSelectedRol(r);
    setShowModal(true);
  };

  const filteredRoles = roles.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (r.nombre && r.nombre.toLowerCase().includes(term))
        || (r.descripcion && r.descripcion.toLowerCase().includes(term));
  });

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          Añadir Rol
        </button>
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
        ) : roles.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShieldCheck size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay roles registrados en el sistema</h2>
            <p>Haz clic en "Añadir Rol" para crear el primer rol.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((r) => (
                <tr key={r.id_rol}>
                  <td>{r.id_rol}</td>
                  <td><span className="badge-rol">{r.nombre}</span></td>
                  <td>{r.descripcion}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarRol(r)} title="Editar rol">
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RolFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedRol(null); }}
        onSuccess={listar}
        rol={selectedRol}
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

export default Roles;
