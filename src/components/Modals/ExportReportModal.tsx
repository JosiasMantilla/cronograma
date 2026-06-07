import { memo, useState, useCallback, useEffect } from 'react';
import type { IFrente, IFilterState, IExportRow } from '../../types';
import { getTareaEstado } from '../../utils/avatarHelpers';

type ExportScope = 'all' | 'filtered' | 'atrasadas' | 'en_progreso';

interface ExportReportModalProps {
  frentes: IFrente[];
  filters: IFilterState;
  onExport: (rows: IExportRow[], filename: string) => void;
  onClose: () => void;
}

const SCOPE_OPTIONS: { value: ExportScope; label: string; desc: string }[] = [
  { value: 'all', label: 'Todo el cronograma', desc: 'Exporta todas las tareas' },
  { value: 'filtered', label: 'Tareas filtradas', desc: 'Solo las tareas visibles con los filtros activos' },
  { value: 'atrasadas', label: 'Solo atrasadas', desc: 'Tareas con fecha fin pasada y avance < 100%' },
  { value: 'en_progreso', label: 'Solo en progreso', desc: 'Tareas con avance entre 1% y 99%' },
];

function buildRows(frentes: IFrente[], scope: ExportScope, filters: IFilterState): IExportRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows: IExportRow[] = [];

  for (const f of frentes) {
    for (const s of f.sectores) {
      for (const t of s.tareas) {
        const estado = getTareaEstado(t);
        let include = false;

        if (scope === 'all') include = true;
        else if (scope === 'atrasadas') include = estado === 'atrasada';
        else if (scope === 'en_progreso') include = estado === 'en_progreso';
        else if (scope === 'filtered') {
          const matchSearch = !filters.search || t.nombre.toLowerCase().includes(filters.search.toLowerCase());
          const matchFrente = !filters.frenteId || f.id === filters.frenteId;
          const matchSector = !filters.sectorId || s.id === filters.sectorId;
          const matchEstado = filters.estado === 'all' || estado === filters.estado;
          include = matchSearch && matchFrente && matchSector && matchEstado;
        }

        if (include) rows.push({ frenteNombre: f.nombre, sectorNombre: s.nombre, tarea: t, estado });
      }
    }
  }

  return rows;
}

export const ExportReportModal = memo(({ frentes, filters, onExport, onClose }: ExportReportModalProps) => {
  const [scope, setScope] = useState<ExportScope>('all');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const hasActiveFilters =
    Boolean(filters.search) || Boolean(filters.frenteId) || Boolean(filters.sectorId) || filters.estado !== 'all';

  const preview = buildRows(frentes, scope, filters).length;

  const handleExport = useCallback(() => {
    const rows = buildRows(frentes, scope, filters);
    const date = new Date().toISOString().slice(0, 10);
    onExport(rows, `Reporte_Cronograma_${date}.xlsx`);
    onClose();
  }, [frentes, scope, filters, onExport, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Exportar reporte"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">📥 Exportar Reporte</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Cerrar">×</button>
        </div>

        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">¿Qué exportar?</p>

        <div className="space-y-2 mb-4">
          {SCOPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                scope === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${opt.value === 'filtered' && !hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                disabled={opt.value === 'filtered' && !hasActiveFilters}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Formato: <span className="font-semibold">Excel (.xlsx)</span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Tareas a exportar: <span className="font-semibold text-blue-600 dark:text-blue-400">{preview}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
          <button
            onClick={handleExport}
            disabled={preview === 0}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Exportar {preview > 0 ? `(${preview})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
});
