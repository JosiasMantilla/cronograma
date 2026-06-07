import { memo, useState, useCallback } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import { ZoomSlider } from './ZoomSlider';
import { ProjectName } from '../common/ProjectName';

interface ToolbarProps {
  hideSectors: boolean;
  hideTasks: boolean;
  isDarkMode: boolean;
  pixelsPerDay: number;
  canPanLeft: boolean;
  canPanRight: boolean;
  isExporting: boolean;
  projectName: string;
  cutDay: number;
  filterBarOpen: boolean;
  hasActiveFilters: boolean;
  onToggleSectors: () => void;
  onToggleTasks: () => void;
  onToggleDark: () => void;
  onCronogramaGeneral: () => void;
  onCronogramaEspecifico: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onGoToToday: () => void;
  onZoomChange: (ppd: number) => void;
  onExport: () => void;
  onProjectNameChange: (name: string) => void;
  onCutDayChange: (day: number) => void;
  onToggleFilterBar: () => void;
  onOpenExportReport: () => void;
}

export const Toolbar = memo((props: ToolbarProps) => {
  const {
    hideSectors,
    hideTasks,
    isDarkMode,
    pixelsPerDay,
    canPanLeft,
    canPanRight,
    isExporting,
    projectName,
    cutDay,
    filterBarOpen,
    hasActiveFilters,
    onToggleSectors,
    onToggleTasks,
    onToggleDark,
    onCronogramaGeneral,
    onCronogramaEspecifico,
    onPanLeft,
    onPanRight,
    onGoToToday,
    onZoomChange,
    onExport,
    onProjectNameChange,
    onCutDayChange,
    onToggleFilterBar,
    onOpenExportReport,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  const handleCutDayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') { onCutDayChange(0); return; }
      const val = Math.min(31, Math.max(1, parseInt(raw, 10) || 0));
      onCutDayChange(val);
    },
    [onCutDayChange],
  );

  const btnBase =
    'px-2.5 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  const btnActive = 'bg-blue-600 text-white hover:bg-blue-700';
  const btnInactive =
    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';
  const btnDisabled = 'opacity-40 cursor-not-allowed';
  const sep = <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden md:block" />;

  return (
    <header className="flex items-center gap-2 px-3 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 flex-wrap">
      {/* Hamburger (mobile) */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Project name (editable) */}
      <ProjectName name={projectName} onChange={onProjectNameChange} />

      <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2 w-full md:w-auto`}>

        {/* Toggle checkboxes */}
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <input type="checkbox" checked={hideSectors} onChange={onToggleSectors} className="w-4 h-4 accent-blue-600" />
          Ocultar Sectores
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <input type="checkbox" checked={hideTasks} onChange={onToggleTasks} className="w-4 h-4 accent-blue-600" />
          Ocultar Tareas
        </label>

        {sep}

        {/* View presets */}
        <button onClick={onCronogramaGeneral} className={`${btnBase} ${btnInactive}`} title="Sectores ocultos">
          General
        </button>
        <button onClick={onCronogramaEspecifico} className={`${btnBase} ${btnInactive}`} title="Todos los niveles">
          Específico
        </button>

        {sep}

        {/* Pan controls */}
        <button
          onClick={onPanLeft}
          disabled={!canPanLeft}
          aria-label="Desplazar izquierda"
          className={`${btnBase} ${btnInactive} ${!canPanLeft ? btnDisabled : ''}`}
        >←</button>
        <button onClick={onGoToToday} className={`${btnBase} ${btnActive}`}>Hoy</button>
        <button
          onClick={onPanRight}
          disabled={!canPanRight}
          aria-label="Desplazar derecha"
          className={`${btnBase} ${btnInactive} ${!canPanRight ? btnDisabled : ''}`}
        >→</button>

        {sep}

        {/* Zoom slider */}
        <ZoomSlider pixelsPerDay={pixelsPerDay} onChange={onZoomChange} />

        {sep}

        {/* Día de corte */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Corte día</span>
          <input
            type="number"
            min={1}
            max={31}
            value={cutDay === 0 ? '' : cutDay}
            onChange={handleCutDayChange}
            placeholder="—"
            className="w-12 px-1.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 text-center"
            aria-label="Día de corte (1-31, vacío = hoy)"
            title="Día del mes para la línea de corte (vacío = hoy)"
          />
        </div>

        {sep}

        {/* Filtros toggle */}
        <button
          onClick={onToggleFilterBar}
          aria-pressed={filterBarOpen}
          className={`${btnBase} flex items-center gap-1 ${filterBarOpen || hasActiveFilters ? btnActive : btnInactive}`}
          title="Mostrar/ocultar filtros"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtros{hasActiveFilters ? ' ●' : ''}
        </button>

        {sep}

        {/* Export Excel */}
        <button
          onClick={onExport}
          disabled={isExporting}
          title="Exportar cronograma a Excel"
          aria-label="Exportar a Excel"
          className={`${btnBase} flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Exportando…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </>
          )}
        </button>

        {/* Export Report */}
        <button
          onClick={onOpenExportReport}
          title="Exportar reporte filtrado"
          aria-label="Exportar reporte"
          className={`${btnBase} flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.586V19a2 2 0 01-2 2z" />
          </svg>
          Reporte
        </button>

        {sep}

        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDark} />
      </div>
    </header>
  );
});
