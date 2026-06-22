import { useState, useEffect, useCallback } from 'react';
import { Bell, X, PackageSearch, CircleCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const AdminToast = () => {
  const [toasts, setToasts] = useState([]);
  const { registerToastHandler } = useSocket();

  const addToast = useCallback((title, message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    registerToastHandler(addToast);
  }, [registerToastHandler, addToast]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`admin-toast admin-toast--${toast.type || 'info'}`}>
          <div className="admin-toast-icon">
            {toast.type === 'new-order' ? <PackageSearch size={18} /> :
             toast.type === 'review' ? <Bell size={18} /> :
             <CircleCheck size={18} />}
          </div>
          <div className="admin-toast-body">
            <p className="admin-toast-title">{toast.title}</p>
            <p className="admin-toast-msg">{toast.message}</p>
          </div>
          <button className="admin-toast-close" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminToast;
