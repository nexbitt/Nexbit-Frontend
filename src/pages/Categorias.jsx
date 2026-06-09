import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Tags } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';

const URL_API = "/api/categorias";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  useModalScroll(showModal);

  // Paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre");
  // Estados vinculados a los campos de la BD
  const [idCategoria, setIdCategoria] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al listar categorias:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listar();
  }, []);

  const limpiarFormulario = () => {
    setNombre(""); 
    setDescripcion("");
    setEnEdicion(false); 
    setIdCategoria(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id_categoria)) + 1 : 1;
    setIdCategoria(nextId);
    setShowModal(true);
  };

  const seleccionarCategoria = (c) => {
    setIdCategoria(c.id_categoria);
    setNombre(c.nombre);
    setDescripcion(c.descripcion || "");
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = { nombre, descripcion };

    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    if (enEdicion) {
      api.put(`${URL_API}/${idCategoria}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Categoría actualizada correctamente.");
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
          alert("Categoría creada con éxito.");
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
          alert("No se puede eliminar la categoría. Es posible que tenga productos asociados.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredCategorias = categorias.filter(c => {
    if (!searchTerm) return true;
    const value = c[searchField];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayItems = filteredCategorias;

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Categoría</button>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
          />
          <select 
            className="search-select" 
            value={searchField}
            onChange={(e) => { setSearchField(e.target.value); }}
          >
            <option value="id_categoria">ID Categoría</option>
            <option value="nombre">Nombre</option>
            <option value="descripcion">Descripción</option>
          </select>
          <button className="btn-search-ok">OK</button>
        </div>
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{enEdicion ? "Actualizar Categoría" : "Nuevo Registro"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idCategoria || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Nombre de Categoría</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  rows={3}
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

export default Categorias;
