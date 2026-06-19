import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, Truck } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CustomDialog from '../components/CustomDialog';
import ProveedorFormModal from '../components/ProveedorFormModal';

const URL_API = "/api/proveedores";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const [searchTerm, setSearchTerm] = useState("");

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setProveedores(res.data))
      .catch(err => console.error("Error al listar proveedores:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { listar(); }, []);

  const abrirRegistro = () => {
    setSelectedProveedor(null);
    setShowModal(true);
  };

  const seleccionarProveedor = (p) => {
    setSelectedProveedor(p);
    setShowModal(true);
  };

  const eliminar = (id) => {
    setDialog({ open: true, type: 'confirm', title: 'Confirmar eliminación', message: '¿Confirmar eliminación de este registro?', onConfirm: () => {
      setDialog({ open: false, type: 'confirm', title: '', message: '', onConfirm: null });
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          setDialog({ open: true, type: 'error', title: 'Error al eliminar', message: "No se puede eliminar el proveedor. Es posible que tenga productos o compras asociadas.\nDetalle: " + (err.response?.data?.error || err.message), onConfirm: null });
        });
    }});
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

      <ProveedorFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedProveedor(null); }}
        onSuccess={listar}
        proveedor={selectedProveedor}
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

export default Proveedores;
