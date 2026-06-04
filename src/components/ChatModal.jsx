import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { getSocketInstance, connectRepartidorSocket, connectSocket } from '../socket';
import { X, Send, MessageSquare, User, Shield } from 'lucide-react';

const ChatModal = ({ pedidoId, onClose }) => {
  const [conversacion, setConversacion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef(null);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const cargarConversacion = async () => {
      try {
        const res = await api.get(`/api/chat/conversacion/pedido/${pedidoId}`);
        setConversacion(res.data);
        setMensajes(res.data.mensajes || []);
      } catch (err) {
        console.error('Error cargando conversación:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarConversacion();
  }, [pedidoId]);

  useEffect(() => {
    let socket = getSocketInstance();
    if (!socket && user) {
      if (user.rol_id === 4) {
        socket = connectRepartidorSocket(user.id_usuario);
      } else {
        socket = connectSocket(user.id_usuario, user.rol_nombre);
      }
    }
    if (!socket || !conversacion) return;

    const convId = conversacion.id_conversacion;
    socket.emit('chat:join', convId);

    const handleMessage = (data) => {
      if (data.conversacion_id === convId || data.conversacionId === convId) {
        setMensajes(prev => [...prev, data]);
      }
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.emit('chat:leave', convId);
      socket.off('chat:message', handleMessage);
    };
  }, [conversacion]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !conversacion || enviando) return;
    setEnviando(true);
    try {
      const res = await api.post(`/api/chat/conversacion/${conversacion.id_conversacion}/mensajes`, {
        mensaje: nuevoMensaje.trim()
      });
      setMensajes(prev => [...prev, res.data]);
      setNuevoMensaje('');
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '450px',
          height: '550px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: '#0f172a',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={20} />
            <span style={{ fontWeight: 700 }}>
              {user?.rol_id === 4 ? 'Chat del pedido' : 'Chat con cliente'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Cargando conversación...
          </div>
        ) : (
          <>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#f8fafc'
            }}>
              {mensajes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                  <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>No hay mensajes aún. Inicia la conversación.</p>
                </div>
              ) : (
                mensajes.map((msg, idx) => {
                  const esAdmin = msg.remitente?.rol_id === 1;
                  const esRepartidor = msg.remitente?.rol_id === 4;
                  const esMio = msg.remitente_id === user?.id_usuario;
                  const nombreRemitente = msg.remitente?.nombre
                    ? msg.remitente.nombre
                    : esMio
                      ? 'Tú'
                      : esAdmin
                        ? 'Administrador'
                        : esRepartidor
                          ? 'Repartidor'
                          : 'Cliente';
                  return (
                    <div
                      key={msg.id_mensaje || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: esMio ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: esMio ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.7rem',
                        color: '#64748b',
                        marginBottom: 2,
                        marginLeft: esMio ? 0 : 4,
                        marginRight: esMio ? 4 : 0,
                        flexDirection: esMio ? 'row-reverse' : 'row'
                      }}>
                        {esAdmin ? <Shield size={10} /> : <User size={10} />}
                        {nombreRemitente}
                      </div>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: esMio ? '#2563eb' : '#fff',
                        color: esMio ? '#fff' : '#1e293b',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        border: esMio ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word'
                      }}>
                        {msg.mensaje}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        color: '#94a3b8',
                        marginTop: 2,
                        marginLeft: esMio ? 0 : 4,
                        marginRight: esMio ? 4 : 0
                      }}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              background: '#fff'
            }}>
              <textarea
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  maxHeight: 80
                }}
              />
              <button
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim() || enviando}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: 'none',
                  background: !nuevoMensaje.trim() ? '#e2e8f0' : '#2563eb',
                  color: !nuevoMensaje.trim() ? '#94a3b8' : '#fff',
                  cursor: !nuevoMensaje.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatModal;