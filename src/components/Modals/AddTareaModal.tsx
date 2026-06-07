import { memo, useState, useCallback, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { formatDateInput } from '../../utils/dateHelpers';
import type { IAddTareaPayload } from '../../types';

interface AddTareaModalProps {
  sectorNombre: string;
  frenteId: string;
  sectorId: string;
  onSave: (frenteId: string, sectorId: string, payload: IAddTareaPayload) => void;
  onClose: () => void;
}

const today = new Date();
const inputCls =
  'w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export const AddTareaModal = memo(
  ({ sectorNombre, frenteId, sectorId, onSave, onClose }: AddTareaModalProps) => {
    const [nombre, setNombre] = useState('');
    const [fechaInicio, setFechaInicio] = useState(formatDateInput(today));
    const [fechaFin, setFechaFin] = useState(formatDateInput(today));
    const [integrante, setIntegrante] = useState('');
    const [integrantes, setIntegrantes] = useState<string[]>([]);
    const [avance, setAvance] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const addIntegrante = useCallback(() => {
      const name = integrante.trim();
      if (name && !integrantes.includes(name)) {
        setIntegrantes((prev) => [...prev, name]);
        setIntegrante('');
      }
    }, [integrante, integrantes]);

    const removeIntegrante = useCallback((name: string) => {
      setIntegrantes((prev) => prev.filter((x) => x !== name));
    }, []);

    const handleSave = useCallback(() => {
      if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }
      const start = parseISO(fechaInicio);
      const end = parseISO(fechaFin);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) { setError('Fechas inválidas.'); return; }
      setError('');
      onSave(frenteId, sectorId, {
        nombre: nombre.trim(),
        fechaInicio: start,
        fechaFin: end,
        integrantes,
        porcentajeAvance: avance,
      });
      onClose();
    }, [nombre, fechaInicio, fechaFin, integrantes, avance, frenteId, sectorId, onSave, onClose]);

    const isInvalidDates = fechaFin < fechaInicio;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="Agregar tarea"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Nueva Tarea</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Cerrar">×</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">Sector: {sectorNombre}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Nombre de la tarea" aria-label="Nombre de la tarea" maxLength={100} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha Inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={inputCls} aria-label="Fecha de inicio" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fecha Fin {isInvalidDates && <span className="text-red-500">⚠</span>}
                </label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className={`${inputCls} ${isInvalidDates ? 'border-red-500' : ''}`} aria-label="Fecha de fin" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Avance: {avance}%</label>
              <input type="range" min={0} max={100} value={avance} onChange={(e) => setAvance(Number(e.target.value))} className="w-full accent-blue-600" aria-label="Porcentaje de avance" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Integrantes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIntegrante(); } }}
                  className={`${inputCls} flex-1`}
                  placeholder="Nombre del integrante"
                  aria-label="Agregar integrante"
                />
                <button
                  onClick={addIntegrante}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  aria-label="Agregar integrante"
                >+</button>
              </div>
              {integrantes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {integrantes.map((name) => (
                    <span key={name} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      {name}
                      <button onClick={() => removeIntegrante(name)} className="text-blue-400 hover:text-red-500" aria-label={`Quitar ${name}`}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Agregar Tarea</button>
          </div>
        </div>
      </div>
    );
  },
);
