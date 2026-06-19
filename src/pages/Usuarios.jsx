import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Users } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import SearchBar from '../components/SearchBar';
import CustomDialog from '../components/CustomDialog';
import UsuarioFormModal from '../components/UsuarioFormModal';

const URL_API = "/api/usuarios";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  useModalScroll(showModal);
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("ALL");
  const [filterEstado, setFilterEstado] = useState("ALL");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Error al listar usuarios:", err))
      .finally(() => setLoading(false));
  };

  const listarRoles = () => {
    api.get(`${URL_API}/roles`)
      .then(res => setRolesList(res.data))
      .catch(err => console.error("Error al listar roles:", err));
  };

  useEffect(() => {
    listar();
    listarRoles();
  }, []);

  const abrirRegistro = () => {
    setSelectedUsuario(null);
    setShowModal(true);
  };

  const seleccionarUsuario = (u) => {
    setSelectedUsuario(u);
    setShowModal(true);
  };

  const eliminar = (id) => {
    setDialog({ open: true, type: 'confirm', title: 'Confirmar eliminación', message: '¿Confirmar eliminación de este registro?', onConfirm: () => {
      setDialog({ open: false, type: 'confirm', title: '', message: '', onConfirm: null });
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          setDialog({ open: true, type: 'error', title: 'Error al eliminar', message: "No se puede eliminar el usuario. Es posible que tenga registros asociados (ventas, compras, etc.).\nDetalle: " + (err.response?.data?.error || err.message), onConfirm: null });
        });
    }});
  };

  const filteredUsuarios = usuarios.filter(u => {
    if (filterRol !== 'ALL' && String(u.rol_id) !== filterRol) return false;
    if (filterEstado === 'ACTIVE' && !u.activo) return false;
    if (filterEstado === 'INACTIVE' && u.activo) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (u.nombre && u.nombre.toLowerCase().includes(term))
        || (u.email && u.email.toLowerCase().includes(term))
        || (u.numero_documento && u.numero_documento.toLowerCase().includes(term));
  });

  const displayItems = filteredUsuarios;

  const handleFilterChange = (key, value) => {
    if (key === 'rol') setFilterRol(value);
    if (key === 'estado') setFilterEstado(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRol('ALL');
    setFilterEstado('ALL');
  };

  const filterValues = { rol: filterRol, estado: filterEstado };

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Usuario</button>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, email o documento..."
          filters={[
            {
              key: 'rol',
              label: 'Todos los roles',
              options: rolesList.map(r => ({ value: String(r.id_rol), label: r.nombre }))
            },
            { key: 'estado', label: 'Todos los estados', options: [
              { value: 'ACTIVE', label: 'Activos' },
              { value: 'INACTIVE', label: 'Inactivos' }
            ]}
          ]}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div> {/* Asume clase css para un loader */}
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Users size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay usuarios registrados</h2>
            <p>Haz clic en "Registrar Usuario" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rol</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td><span className="badge-rol">{u.rol_nombre}</span></td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.numero_documento}</td>
                  <td>
                    <button className={`status-toggle ${u.activo ? 'is-active' : 'is-inactive'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarUsuario(u)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(u.id_usuario)}>
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

      <UsuarioFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedUsuario(null); }}
        onSuccess={listar}
        usuario={selectedUsuario}
        rolesList={rolesList}
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

export default Usuarios;
