import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle, Upload, FileImage, X, ChevronLeft, Building, AlertCircle, Smartphone, CreditCard, Landmark } from 'lucide-react';

const CONFIRMACION_RUTA = '/api/pedidos';

const bankIcons = {
  'Bancolombia': Landmark,
  'Nequi': Smartphone,
  'default': Building,
};

const ConfirmacionPedido = ({ variant }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [totalPagar, setTotalPagar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`${CONFIRMACION_RUTA}/${id}/ticket`),
      api.get('/api/bancos').catch(() => ({ data: [] }))
    ])
      .then(([pedidoRes, bancosRes]) => {
        setPedido(pedidoRes.data);
        setCuentasBancarias(bancosRes.data);
        setTotalPagar(Number(pedidoRes.data.total));
      })
      .catch(() => navigate(`/${variant}/pedidos`))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selected.type)) {
      setError('Solo se permiten imágenes JPG o PNG');
      return;
    }
    if (selected.size > 3 * 1024 * 1024) {
      setError('La imagen no debe superar los 3MB');
      return;
    }
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('comprobante', file);
      await api.post(`${CONFIRMACION_RUTA}/${id}/subir-comprobante`, formData);
      setUploaded(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir comprobante');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Cargando pedido...</div>;
  }

  if (uploaded) {
    return (
      <div className="storefront-container" style={{ paddingTop: 10, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ padding: '3rem 2rem' }}>
          <CheckCircle size={64} color="#15803d" style={{ marginBottom: 16 }} />
          <h2 style={{ marginBottom: 12 }}>Comprobante enviado</h2>
          <p style={{ color: '#555', marginBottom: 8 }}>
            Tu comprobante de pago ha sido recibido. El administrador lo revisará pronto.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>
            Recibirás una notificación cuando el pago sea aprobado.
          </p>
          <button className="btn-save" onClick={() => navigate(`/${variant}/pedidos`)}>
            Ir a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-container" style={{ paddingTop: 10 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button
          onClick={() => navigate(`/${variant}/pedidos`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', marginBottom: 20, padding: 0, fontSize: '0.9rem' }}
        >
          <ChevronLeft size={18} /> Volver a mis pedidos
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CheckCircle size={48} color="#15803d" style={{ marginBottom: 12 }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Pedido #{id} creado</h1>
          <p style={{ color: '#64748b' }}>Tu pedido está pendiente de pago. Realiza la transferencia y sube el comprobante.</p>
        </div>

        {cuentasBancarias.length > 0 && (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#92400e' }}>
              <Building size={20} /> Datos bancarios para transferencia
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: 16, lineHeight: 1.5 }}>
              Realiza la transferencia por el valor total a una de las siguientes cuentas y sube el comprobante.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cuentasBancarias.map((cuenta, i) => {
                const Icon = bankIcons[cuenta.banco] || bankIcons.default;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fde68a' }}>
                    <Icon size={24} color="#92400e" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cuenta.banco}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all' }}>{cuenta.tipo_cuenta}: {cuenta.numero_cuenta}</div>
                      <div style={{ fontSize: '0.8rem', color: '#92400e' }}>{cuenta.titular}{cuenta.documento ? ` · ${cuenta.documento}` : ''}</div>
                      {cuenta.descripcion && <div style={{ fontSize: '0.75rem', color: '#a16207' }}>{cuenta.descripcion}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', borderRadius: 10, border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Monto a pagar:</span>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#92400e' }}>${totalPagar.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={20} /> Subir comprobante de pago
          </h3>

          {!preview ? (
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#fafbfc' }}
              onClick={() => document.getElementById('comprobante-input').click()}
            >
              <FileImage size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
              <p style={{ color: '#64748b', marginBottom: 8 }}>Haz clic para seleccionar la imagen del comprobante</p>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>JPG o PNG · Máximo 3MB</p>
              <input
                id="comprobante-input"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16, maxWidth: '100%' }}>
                <img src={preview} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid var(--border)' }} />
                <button
                  onClick={() => { setFile(null); setPreview(null); setError(''); }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} color="white" />
                </button>
              </div>

              <button
                className="btn-checkout-red"
                onClick={handleUpload}
                disabled={uploading}
                style={{ opacity: uploading ? 0.7 : 1, width: '100%' }}
              >
                {uploading ? 'Subiendo...' : 'Enviar Comprobante'}
              </button>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', marginTop: 12, fontSize: '0.9rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionPedido;
