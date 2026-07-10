
import { useState, useEffect } from 'react';
import api from '../api';
import { Users, ArrowLeft, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        rol_id: 2,       // Rol "Cliente" por defecto (id_rol = 2)
        nombre: '',
        email: '',
        password: '',
        tipo_documento: '',
        numero_documento: '',
        telefono: '',
        direccion: '',
        // Info de emergencia
        emergencia_nombre: '',
        emergencia_telefono: '',
        emergencia_parentesco: ''
    });

    // Estados para UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/api/v1/usuarios/roles');
            setRoles(res.data);
            
            if (res.data.length > 0) {
                // Buscar rol "cliente" o "usuario", si no existe asignar el primero disponible
                const roleCliente = res.data.find(r => 
                    r.nombre.toLowerCase().includes('cliente') || 
                    r.nombre.toLowerCase().includes('usuario')
                ) || res.data[0];
                
                setFormData(prev => ({ ...prev, rol_id: roleCliente.id_rol }));
            }
        } catch (err) {
            console.error("Error cargando roles:", err);
            setError("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        setLoading(true);
        try {
            // Enviar info de emergencia como objeto anidado
            const payload = {
                ...formData,
                emergencia: formData.emergencia_nombre ? {
                    nombre: formData.emergencia_nombre,
                    telefono: formData.emergencia_telefono,
                    parentesco: formData.emergencia_parentesco
                } : undefined
            };
            delete payload.emergencia_nombre;
            delete payload.emergencia_telefono;
            delete payload.emergencia_parentesco;

            await api.post('/api/v1/usuarios', payload);
            setSuccess('¡Usuario registrado exitosamente! Ya puedes iniciar sesión.');
            setFormData({
                rol_id: '',
                nombre: '',
                email: '',
                password: '',
                tipo_documento: '',
                numero_documento: '',
                telefono: '',
                direccion: '',
                emergencia_nombre: '',
                emergencia_telefono: '',
                emergencia_parentesco: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error al intentar registrar el usuario. Verifica los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', padding: '2rem 1rem' }}>
            <div className="modal-box" style={{ width: '100%', maxWidth: '700px', transform: 'none', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/usuario/inicio" style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.5rem' }}>
                            <path d="M12 2L2 22H22L12 2Z" fill="var(--primary)"/>
                        </svg>
                    </Link>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>Registrarse</h2>
                    <p style={{ color: '#64748b' }}>Crea tu cuenta personal en Nexbit</p>
                </div>

                {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
                {success && <div style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

                    <div className="input-field">
                        <label>Nombre Completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
                    </div>

                    <div className="input-field">
                        <label>Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ej: correo@ejemplo.com" required />
                    </div>

                    <div className="input-field">
                        <label>Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="***" required />
                    </div>


                    <div className="input-field">
                        <label>Tipo de Documento</label>
                        <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                            <option value="">Seleccione una opción...</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PASAPORTE">Pasaporte</option>
                        </select>
                    </div>

                    <div className="input-field">
                        <label>Número de Documento</label>
                        <input type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} placeholder="Ej: 10203040" />
                    </div>

                    <div className="input-field">
                        <label>Teléfono</label>
                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 300 123 4567" />
                    </div>

                    <div className="input-field">
                        <label>Dirección</label>
                        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ej: Calle 123 #45-67" />
                    </div>

                    {/* ── INFORMACIÓN DE EMERGENCIA ── */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', padding: '1rem', background: '#FFF7ED', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#9A3412', fontWeight: 600, fontSize: '0.9rem' }}>
                            <Phone size={16} /> Información de Emergencia (opcional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="input-field" style={{ margin: 0 }}>
                                <label>Nombre de Contacto</label>
                                <input type="text" name="emergencia_nombre" value={formData.emergencia_nombre} onChange={handleChange} placeholder="Ej: María Pérez" />
                            </div>
                            <div className="input-field" style={{ margin: 0 }}>
                                <label>Teléfono de Emergencia</label>
                                <input type="text" name="emergencia_telefono" value={formData.emergencia_telefono} onChange={handleChange} placeholder="Ej: 300 987 6543" />
                            </div>
                            <div className="input-field" style={{ margin: 0 }}>
                                <label>Parentesco</label>
                                <input type="text" name="emergencia_parentesco" value={formData.emergencia_parentesco} onChange={handleChange} placeholder="Ej: Madre, Padre, Hermano" />
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <button 
                            className="btn-save" 
                            type="submit" 
                            style={{ 
                                width: '100%', padding: '0.8rem', fontSize: '1rem', 
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                cursor: 'pointer', border: 'none', borderRadius: '8px',
                                boxSizing: 'border-box'
                            }} 
                            disabled={loading}
                        >
                            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }}></div> : 'Crear Cuenta'}
                        </button>

                        <Link 
                            to="/login" 
                            style={{ 
                                width: '100%', padding: '0.8rem', fontSize: '1rem', 
                                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                backgroundColor: '#f1f5f9', color: '#475569', 
                                textDecoration: 'none', borderRadius: '8px', 
                                fontWeight: '600', boxSizing: 'border-box',
                                border: '1px solid #e2e8f0', gap: '0.5rem' 
                            }}
                        >
                            <ArrowLeft size={18} /> Ya tengo cuenta / Volver
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

