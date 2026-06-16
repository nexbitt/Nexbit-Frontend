/**
 * @file useModalScroll.js
 * @description Hook que bloquea el scroll del body mientras un modal está abierto.
 * Agrega/quita la clase `modal-open` del body automáticamente al montar/desmontar.
 */
import { useEffect } from 'react';

/**
 * Llama este hook dentro del componente del modal (o dentro del CRUD cuando
 * `isOpen` sea true). Se limpia automáticamente al cerrar.
 *
 * @param {boolean} isOpen - true cuando el modal está visible
 */
export function useModalScroll(isOpen) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
}
