import { memo, useCallback } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { getBarColor, isDelayed } from '../../utils/ganttHelpers';
import type { ITarea } from '../../types';

interface GanttBarProps {
  tarea: ITarea;
  timelineStart: Date;
  pixelsPerDay: number;
  rowHeight: number;
  isSelected: boolean;
  onHover: (tarea: ITarea | null, x: number, y: number) => void;
  onRightClick: (tareaId: string) => void;
  onDoubleClick: (tareaId: string) => void;
}

const BAR_PADDING_V = 10;

export const GanttBar = memo(
  ({
    tarea,
    timelineStart,
    pixelsPerDay,
    rowHeight,
    isSelected,
    onHover,
    onRightClick,
    onDoubleClick,
  }: GanttBarProps) => {
    const isInvalid = tarea.fechaFin < tarea.fechaInicio;
    const delayed = !isInvalid && isDelayed(tarea.fechaFin, tarea.porcentajeAvance);

    const startDay = differenceInCalendarDays(tarea.fechaInicio, timelineStart);
    const endDay = differenceInCalendarDays(
      isInvalid ? tarea.fechaInicio : tarea.fechaFin,
      timelineStart,
    );
    const left = startDay * pixelsPerDay;
    const width = Math.max((endDay - startDay + 1) * pixelsPerDay, 4);
    const barHeight = rowHeight - BAR_PADDING_V * 2;
    const topOffset = Math.floor((rowHeight - barHeight) / 2);

    const colorClass = getBarColor(tarea.porcentajeAvance, isInvalid);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent) => onHover(tarea, e.clientX, e.clientY),
      [tarea, onHover],
    );

    const handleMouseLeave = useCallback(() => onHover(null, 0, 0), [onHover]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => onHover(tarea, e.clientX, e.clientY),
      [tarea, onHover],
    );

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRightClick(tarea.id);
      },
      [tarea.id, onRightClick],
    );

    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDoubleClick(tarea.id);
      },
      [tarea.id, onDoubleClick],
    );

    return (
      <div
        role="listitem"
        aria-label={`${tarea.nombre} ${tarea.porcentajeAvance}%`}
        tabIndex={0}
        className={`absolute rounded cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400 ${colorClass} ${
          isSelected ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''
        } ${delayed ? 'bar-delayed' : ''}`}
        style={{ left, top: topOffset, width, height: barHeight }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRightClick(tarea.id);
          if (e.key === ' ') { e.preventDefault(); onDoubleClick(tarea.id); }
        }}
      >
        {/* Progress overlay */}
        {!isInvalid && tarea.porcentajeAvance > 0 && tarea.porcentajeAvance < 100 && (
          <div
            className="absolute top-0 right-0 h-full rounded bg-black/20"
            style={{ width: `${100 - tarea.porcentajeAvance}%` }}
            aria-hidden="true"
          />
        )}
        {/* Label */}
        {width > 40 && (
          <span className="absolute inset-0 flex items-center px-1.5 text-[10px] font-semibold text-white truncate pointer-events-none">
            {tarea.nombre}
          </span>
        )}
      </div>
    );
  },
);
