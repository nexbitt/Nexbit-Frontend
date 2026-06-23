import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Users, Search, X, Filter, Plus } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import CustomDialog from '../components/ui/CustomDialog';
import UsuarioFormModal from '../components/ui/UsuarioFormModal';

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

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 12px', boxSizing: 'border-box' }}>
          <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre, email o documento..." style={{ border: 'none', outline: 'none', flex: 1, padding: '0 8px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', width: '100%' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} color="#9CA3AF" /></button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 8px 0 12px', width: '180px', flexShrink: 0, boxSizing: 'border-box' }}>
          <Users size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <select value={filterRol} onChange={e => setFilterRol(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, padding: '0 4px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', cursor: 'pointer' }}>
            <option value="ALL">Todos los roles</option>
            {rolesList.map(r => <option key={r.id_rol} value={String(r.id_rol)}>{r.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 8px 0 12px', width: '150px', flexShrink: 0, boxSizing: 'border-box' }}>
          <Filter size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, padding: '0 4px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', cursor: 'pointer' }}>
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
        <button onClick={abrirRegistro} style={{ height: '42px', padding: '0 24px', borderRadius: '9999px', border: 'none', background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
          <Plus size={16} /> Añadir Usuario
        </button>
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
