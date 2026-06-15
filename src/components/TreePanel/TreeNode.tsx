import { memo, useCallback } from 'react';
import { TareaDetails } from './TareaDetails';
import { ROW_HEIGHT, SECTOR_ROW_HEIGHT } from '../../utils/constants';
import type { IRow } from '../../types';

interface TreeNodeProps {
  row: IRow;
  style: React.CSSProperties;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const FRENTE_BG =
  'bg-blue-50 dark:bg-blue-900/30 font-semibold text-blue-800 dark:text-blue-200';
const SECTOR_BG =
  'bg-gray-50 dark:bg-gray-800/60 font-medium text-gray-700 dark:text-gray-300';
const TAREA_BG = 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100';
const SELECTED = 'ring-1 ring-inset ring-blue-400';
const FOCUS_RING =
  'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset';

export const TreeNode = memo(
  ({ row, style, isSelected, onToggle, onSelect }: TreeNodeProps) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (row.type !== 'tarea') onToggle(row.id);
          else onSelect(row.id);
        }
      },
      [row, onToggle, onSelect],
    );

    if (row.type === 'tarea') {
      return (
        <div
          style={{ ...style, height: ROW_HEIGHT }}
          role="treeitem"
          tabIndex={0}
          aria-selected={isSelected}
          className={`border-b border-gray-100 dark:border-gray-700/50 cursor-pointer ${TAREA_BG} ${isSelected ? SELECTED : ''} hover:bg-blue-50/50 dark:hover:bg-blue-900/20 ${FOCUS_RING}`}
          onClick={() => onSelect(row.id)}
          onKeyDown={handleKeyDown}
        >
          <TareaDetails tarea={row.tarea} depth={row.depth} />
        </div>
      );
    }

    const indent = row.depth * 12;
    const label = row.type === 'frente' ? row.frente.nombre : row.sector.nombre;
    const bgClass = row.type === 'frente' ? FRENTE_BG : SECTOR_BG;
    const countLabel =
      row.type === 'frente'
        ? `${row.frente.sectores.length} sectores`
        : `${row.sector.tareas.length} tareas`;

    return (
      <div
        style={{ ...style, height: row.type ==='sector' 
        ? SECTOR_ROW_HEIGHT : ROW_HEIGHT, paddingLeft: indent + 8 }}
        role="treeitem"
        tabIndex={0}
        aria-expanded={row.isExpanded}
        className={`border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5 text-sm cursor-pointer ${bgClass} hover:brightness-95 pr-2 ${FOCUS_RING}`}
        onClick={() => onToggle(row.id)}
        onKeyDown={handleKeyDown}
      >
        <span
          className="text-gray-400 dark:text-gray-500 w-3.5 text-center shrink-0 transition-transform duration-150"
          style={{ transform: row.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▶
        </span>

        <span className="shrink-0" aria-hidden="true">
          {row.type === 'frente' ? '🏗' : '📋'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="truncate">
            {label}
           </div>

            {row.type === 'sector' && (
              <div className="text-[10px] whitespace-nowrap text-gray-500 dark:text-gray-400">
                Inicio:{' '}
                {row.fechaInicioSector?.toLocaleDateString('es-PE')}
                {' → '}
                Fin:{' '}
                {row.fechaFinSector?.toLocaleDateString('es-PE')}
              </div>
            )} 
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{countLabel}</span>
      </div>
    );
  },
);
