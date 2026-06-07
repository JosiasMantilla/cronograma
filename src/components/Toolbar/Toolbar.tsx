import { memo, useState } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import { ZoomSlider } from './ZoomSlider';

interface ToolbarProps {
  hideSectors: boolean;
  hideTasks: boolean;
  isDarkMode: boolean;
  pixelsPerDay: number;
  canPanLeft: boolean;
  canPanRight: boolean;
  onToggleSectors: () => void;
  onToggleTasks: () => void;
  onToggleDark: () => void;
  onCronogramaGeneral: () => void;
  onCronogramaEspecifico: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onGoToToday: () => void;
  onZoomChange: (ppd: number) => void;
}

export const Toolbar = memo((props: ToolbarProps) => {
  const {
    hideSectors,
    hideTasks,
    isDarkMode,
    pixelsPerDay,
    canPanLeft,
    canPanRight,
    onToggleSectors,
    onToggleTasks,
    onToggleDark,
    onCronogramaGeneral,
    onCronogramaEspecifico,
    onPanLeft,
    onPanRight,
    onGoToToday,
    onZoomChange,
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);

  const btnBase =
    'px-2.5 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  const btnActive = 'bg-blue-600 text-white hover:bg-blue-700';
  const btnInactive = 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';
  const btnDisabled = 'opacity-40 cursor-not-allowed';

  return (
    <header className="flex items-center gap-2 px-3 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 flex-wrap">
      {/* Hamburger menu for mobile */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <span className="font-bold text-gray-800 dark:text-white text-sm md:text-base mr-2">
        Cronograma Gantt
      </span>

      <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2 w-full md:w-auto`}>
        {/* Toggle checkboxes */}
        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideSectors}
            onChange={onToggleSectors}
            className="w-4 h-4 accent-blue-600"
          />
          Ocultar Sectores
        </label>

        <label className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideTasks}
            onChange={onToggleTasks}
            className="w-4 h-4 accent-blue-600"
          />
          Ocultar Tareas
        </label>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden md:block" />

        {/* View presets */}
        <button
          onClick={onCronogramaGeneral}
          className={`${btnBase} ${btnInactive}`}
          title="Sectores ocultos, tareas bajo frente"
        >
          General
        </button>
        <button
          onClick={onCronogramaEspecifico}
          className={`${btnBase} ${btnInactive}`}
          title="Todos los niveles visibles"
        >
          Específico
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden md:block" />

        {/* Pan controls */}
        <button
          onClick={onPanLeft}
          disabled={!canPanLeft}
          aria-label="Desplazar izquierda"
          className={`${btnBase} ${btnInactive} ${!canPanLeft ? btnDisabled : ''}`}
        >
          ←
        </button>
        <button
          onClick={onGoToToday}
          className={`${btnBase} ${btnActive}`}
        >
          Hoy
        </button>
        <button
          onClick={onPanRight}
          disabled={!canPanRight}
          aria-label="Desplazar derecha"
          className={`${btnBase} ${btnInactive} ${!canPanRight ? btnDisabled : ''}`}
        >
          →
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden md:block" />

        {/* Zoom slider */}
        <ZoomSlider pixelsPerDay={pixelsPerDay} onChange={onZoomChange} />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden md:block" />

        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDark} />
      </div>
    </header>
  );
});
