import { AlertTriangle, Ban, CheckCircle, AlertCircle } from 'lucide-react';

const DIALOG_CONFIG = {
  confirm: {
    icon: AlertTriangle,
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    defaultTitle: 'Confirmar eliminación',
    defaultMessage: '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.',
  },
  validation: {
    icon: AlertCircle,
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    defaultTitle: 'Revisar información',
    defaultMessage: '',
  },
  error: {
    icon: Ban,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    defaultTitle: 'Error en la operación',
    defaultMessage: 'No se puede eliminar el registro. Razón: Este elemento se encuentra vinculado activamente a otras transacciones o históricos dentro del sistema. Se recomienda cambiar su estado a "Inactivo" en su lugar.',
  },
  success: {
    icon: CheckCircle,
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    defaultTitle: 'Operación exitosa',
    defaultMessage: 'El registro ha sido almacenado de manera segura en la base de datos y actualizado en los listados generales.',
  },
};

const CustomDialog = ({
  type = 'success',
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  children,
}) => {
  if (!open) return null;

  const config = DIALOG_CONFIG[type] || DIALOG_CONFIG.success;
  const Icon = config.icon;
  const finalTitle = title || config.defaultTitle;
  const finalMessage = message || config.defaultMessage;

  const isConfirm = type === 'confirm';
  const singleButton = !isConfirm;

  return (
    <div className="cd-overlay" onClick={onClose}>
      <div className="cd-box" onClick={(e) => e.stopPropagation()}>
        <div className="cd-icon-wrap" style={{ background: config.iconBg }}>
          <Icon size={32} color={config.iconColor} />
        </div>

        <h3 className="cd-title">{finalTitle}</h3>

        {children || (
          <p className="cd-message">{finalMessage}</p>
        )}

        <div className={`cd-actions ${singleButton ? 'cd-actions--single' : ''}`}>
          {isConfirm && (
            <button className="cd-btn cd-btn--cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button
            className={`cd-btn ${isConfirm ? 'cd-btn--danger' : 'cd-btn--primary'}`}
            onClick={onConfirm || onClose}
          >
            {isConfirm ? confirmText : singleButton ? 'Entendido' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
