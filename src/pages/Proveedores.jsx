import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Pencil, Trash2, Truck, AlertCircle } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import SearchBar from '../components/SearchBar';

const URL_API = "/api/proveedores";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  useModalScroll(showModal);

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  // Campos de la BD
  const [idProveedor, setIdProveedor] = useState(null);
  const [nit, setNit] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [activo, setActivo] = useState(1);

  // Validación de campo individual
  const [fieldErrors, setFieldErrors] = useState({});

  const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
  const NIT_REGEX = /^[0-9.\-]+$/;

  const handleKeyDown = (e, regex) => {
    if (e.key.length === 1 && !regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e, regex) => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    if (!regex.test(pasted)) {
      e.preventDefault();
    }
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'nombre' && value.trim().length > 0 && !NAME_REGEX.test(value)) { error = 'Solo letras y espacios'; }
    if (field === 'nit' && value.length > 0 && !NIT_REGEX.test(value)) { error = 'Solo números, puntos y guiones'; }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setProveedores(res.data))
      .catch(err => console.error("Error al listar proveedores:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    listar();
  }, []);

  const limpiarFormulario = () => {
    setNit(""); setNombre(""); setTelefono(""); 
    setCorreo(""); setDireccion(""); setActivo(1);
    setEnEdicion(false); setIdProveedor(null);
    setFieldErrors({});
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = proveedores.length > 0 ? Math.max(...proveedores.map(p => p.id_proveedor)) + 1 : 1;
    setIdProveedor(nextId);
    setShowModal(true);
  };

  const seleccionarProveedor = (p) => {
    setIdProveedor(p.id_proveedor);
    setNit(p.nit);
    setNombre(p.nombre);
    setTelefono(p.telefono || "");
    setCorreo(p.correo || "");
    setDireccion(p.direccion || "");
    setActivo(p.activo);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = { nit, nombre, telefono, correo, direccion, activo };

    const errNombre = validateField('nombre', nombre);
    const errNit = validateField('nit', nit);
    if (errNombre || errNit) return;

    if (!nit || !nombre) {
      alert("El NIT y el nombre son obligatorios");
      return;
    }

    if (enEdicion) {
      api.put(`${URL_API}/${idProveedor}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Proveedor actualizado correctamente.");
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
          alert("Proveedor creado con éxito.");
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
          alert("No se puede eliminar el proveedor. Es posible que tenga productos o compras asociadas.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredProveedores = proveedores.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (p.nombre && p.nombre.toLowerCase().includes(term))
        || (p.nit && p.nit.toLowerCase().includes(term))
        || (p.correo && p.correo.toLowerCase().includes(term));
  });

  const displayItems = filteredProveedores;

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Proveedor</button>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre, NIT o correo..."
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : proveedores.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Truck size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay proveedores registrados</h2>
            <p>Haz clic en "Registrar Proveedor" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NIT</th>
                <th>Nombre / Empresa</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((p) => (
                <tr key={p.id_proveedor}>
                  <td>{p.id_proveedor}</td>
                  <td>{p.nit}</td>
                  <td>{p.nombre}</td>
                  <td>{p.telefono}</td>
                  <td>{p.correo}</td>
                  <td>
                    <button className={`status-toggle ${p.activo ? 'is-active' : 'is-inactive'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarProveedor(p)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(p.id_proveedor)}>
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
            <h2>{enEdicion ? "Actualizar Proveedor" : "Nuevo Registro"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idProveedor || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
              </div>
              <div className="input-field">
                <label>NIT</label>
                <input
                  value={nit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9.\-]*$/.test(val)) setNit(val);
                  }}
                  onBlur={() => validateField('nit', nit)}
                  style={{ borderColor: fieldErrors.nit ? '#EF4444' : undefined, borderWidth: fieldErrors.nit ? '2px' : undefined }}
                />
                {fieldErrors.nit && (
                  <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={14} /> {fieldErrors.nit}
                  </span>
                )}
              </div>
              <div className="input-field">
                <label>Nombre o Empresa</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, NAME_REGEX)}
                  onPaste={(e) => handlePaste(e, NAME_REGEX)}
                  onBlur={() => validateField('nombre', nombre)}
                  style={{ borderColor: fieldErrors.nombre ? '#EF4444' : undefined, borderWidth: fieldErrors.nombre ? '2px' : undefined }}
                />
                {fieldErrors.nombre && (
                  <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={14} /> {fieldErrors.nombre}
                  </span>
                )}
              </div>
              <div className="input-field">
                <label>Teléfono</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Correo</label>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Dirección</label>
                <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Estado</label>
                <select value={activo} onChange={(e) => setActivo(Number(e.target.value))}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
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

export default Proveedores;
