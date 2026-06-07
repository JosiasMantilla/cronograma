import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { formatDateInput } from '../../utils/dateHelpers';
import { getTareaEstado, ESTADO_LABEL, ESTADO_COLOR } from '../../utils/avatarHelpers';
import type { ITarea, IEditTareaPayload } from '../../types';

interface EditTareaModalProps {
  tarea: ITarea;
  onSave: (id: string, payload: IEditTareaPayload) => void;
  onClose: () => void;
}

export const EditTareaModal = memo(({ tarea, onSave, onClose }: EditTareaModalProps) => {
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(tarea.fechaInicio));
  const [fechaFin, setFechaFin] = useState(formatDateInput(tarea.fechaFin));
  const [avance, setAvance] = useState(tarea.porcentajeAvance);
  const [error, setError] = useState('');

  const estado = useMemo(() => getTareaEstado(tarea), [tarea]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const isFuture = tarea.fechaInicio > today && tarea.porcentajeAvance === 0;
  const isOverdue = estado === 'atrasada';
  const isCompleted = estado === 'completada';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = useCallback(() => {
    const start = parseISO(fechaInicio);
    const end = parseISO(fechaFin);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Fechas inválidas.');
      return;
    }
    if (avance < 0 || avance > 100) {
      setError('El avance debe estar entre 0 y 100.');
      return;
    }
    setError('');
    onSave(tarea.id, { fechaInicio: start, fechaFin: end, porcentajeAvance: avance });
    onClose();
  }, [fechaInicio, fechaFin, avance, tarea.id, onSave, onClose]);

  const isInvalidDates = fechaFin < fechaInicio;

  const inputCls =
    'w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Editar tarea"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Editar Tarea</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1" title={tarea.nombre}>
            {tarea.nombre}
          </p>
          <span className={`text-xs font-semibold shrink-0 ${ESTADO_COLOR[estado]}`}>
            {ESTADO_LABEL[estado]}
          </span>
        </div>

        {isFuture && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs">
            ℹ Esta tarea aún no ha comenzado. El avance estará bloqueado hasta su fecha de inicio.
          </div>
        )}
        {isOverdue && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            ⚠ Esta tarea está atrasada. Actualiza el avance o ajusta las fechas.
          </div>
        )}
        {isCompleted && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs">
            ✓ Tarea completada. Puedes ajustar las fechas si es necesario.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={inputCls}
              aria-label="Fecha de inicio"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Fecha de Fin
              {isInvalidDates && (
                <span className="ml-2 text-red-500">⚠ Fecha fin anterior a inicio</span>
              )}
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={`${inputCls} ${isInvalidDates ? 'border-red-500' : ''}`}
              aria-label="Fecha de fin"
              aria-invalid={isInvalidDates}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Porcentaje de Avance: {avance}%
              {isFuture && <span className="ml-2 text-blue-400">(bloqueado)</span>}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={avance}
              onChange={(e) => { if (!isFuture) setAvance(Number(e.target.value)); }}
              disabled={isFuture}
              className={`w-full accent-blue-600 ${isFuture ? 'opacity-40 cursor-not-allowed' : ''}`}
              aria-label="Porcentaje de avance"
              aria-disabled={isFuture}
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
});
