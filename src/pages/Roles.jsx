import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import SearchBar from '../components/SearchBar';

const URL_API = "/api/roles";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  useModalScroll(showModal);
  
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  
  // Campos de la BD
  const [idRol, setIdRol] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setRoles(res.data))
      .catch(err => console.error("Error al listar roles:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listar();
  }, []);

  const limpiarFormulario = () => {
    setNombre(""); setDescripcion("");
    setEnEdicion(false); setIdRol(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = roles.length > 0 ? Math.max(...roles.map(r => r.id_rol)) + 1 : 1;
    setIdRol(nextId);
    setShowModal(true);
  };

  const seleccionarRol = (r) => {
    setIdRol(r.id_rol);
    setNombre(r.nombre);
    setDescripcion(r.descripcion || "");
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = { nombre, descripcion };

    if (!nombre) {
      alert("El nombre del rol es obligatorio");
      return;
    }

    if (enEdicion) {
      api.put(`${URL_API}/${idRol}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Rol actualizado correctamente.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al actualizar: " + (err.response?.data?.message || err.message));
        });
    } else {
      api.post(URL_API, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Rol creado con éxito.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al crear: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const eliminar = (id) => {
    if (window.confirm("¿Confirmar eliminación de este registro?")) {
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          alert("No se puede eliminar el rol. Es posible que existan usuarios asociados a él.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredRoles = roles.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (r.nombre && r.nombre.toLowerCase().includes(term))
        || (r.descripcion && r.descripcion.toLowerCase().includes(term));
  });

  const displayItems = filteredRoles;

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Rol</button>
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
            <h2>No hay roles registrados</h2>
            <p>Haz clic en "Registrar Rol" para comenzar.</p>
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
              {displayItems.map((r) => (
                <tr key={r.id_rol}>
                  <td>{r.id_rol}</td>
                  <td><span className="badge-rol">{r.nombre}</span></td>
                  <td>{r.descripcion}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarRol(r)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(r.id_rol)}>
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{enEdicion ? "Actualizar Rol" : "Nuevo Rol"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idRol || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Nombre del Rol</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={limpiarFormulario}>Cancelar</button>
              <button className="btn-save" onClick={guardar}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Roles;
