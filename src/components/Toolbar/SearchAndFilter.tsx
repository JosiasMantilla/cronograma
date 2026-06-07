import { memo, useCallback } from 'react';
import type { IFilterState, IFrente } from '../../types';

interface SearchAndFilterProps {
  filters: IFilterState;
  frentes: IFrente[];
  onChange: (filters: IFilterState) => void;
  onClear: () => void;
}

const ESTADO_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'completada', label: 'Completada (100%)' },
  { value: 'en_progreso', label: 'En progreso (1-99%)' },
  { value: 'no_iniciada', label: 'No iniciada (0%)' },
  { value: 'atrasada', label: 'Atrasada' },
];

const selectCls =
  'text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500';

export const SearchAndFilter = memo(({ filters, frentes, onChange, onClear }: SearchAndFilterProps) => {
  const set = useCallback(
    (patch: Partial<IFilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const sectors = frentes.find((f) => f.id === filters.frenteId)?.sectores ?? [];

  const hasActive =
    Boolean(filters.search) ||
    Boolean(filters.frenteId) ||
    Boolean(filters.sectorId) ||
    filters.estado !== 'all';

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Buscar tarea…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Buscar tarea"
        />
      </div>

      {/* Frente filter */}
      <select
        value={filters.frenteId}
        onChange={(e) => set({ frenteId: e.target.value, sectorId: '' })}
        className={selectCls}
        aria-label="Filtrar por frente"
      >
        <option value="">Todos los frentes</option>
        {frentes.map((f) => (
          <option key={f.id} value={f.id}>{f.nombre}</option>
        ))}
      </select>

      {/* Sector filter */}
      <select
        value={filters.sectorId}
        onChange={(e) => set({ sectorId: e.target.value })}
        className={selectCls}
        disabled={!filters.frenteId}
        aria-label="Filtrar por sector"
      >
        <option value="">Todos los sectores</option>
        {sectors.map((s) => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>

      {/* Estado filter */}
      <select
        value={filters.estado}
        onChange={(e) => set({ estado: e.target.value as IFilterState['estado'] })}
        className={selectCls}
        aria-label="Filtrar por estado"
      >
        {ESTADO_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={onClear}
          className="text-xs px-2.5 py-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          aria-label="Limpiar filtros"
        >
          ✕ Limpiar
        </button>
      )}

      {hasActive && (
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Filtros activos
        </span>
      )}
    </div>
  );
});
