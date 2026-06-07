import { memo } from 'react';
import { GanttBar } from './GanttBar';
import type { IRow, ITarea } from '../../types';

interface GanttRowProps {
  row: IRow;
  style: React.CSSProperties;
  panOffset: number;
  pixelsPerDay: number;
  timelineStart: Date;
  totalWidth: number;
  selectedTareaId: string | null;
  onHover: (tarea: ITarea | null, x: number, y: number) => void;
  onRightClick: (tareaId: string) => void;
  onDoubleClick: (tareaId: string) => void;
}

const FRENTE_BG = 'bg-blue-50 dark:bg-blue-900/30';
const SECTOR_BG = 'bg-gray-50 dark:bg-gray-800/60';
const TAREA_BG = 'bg-white dark:bg-gray-900';

export const GanttRow = memo(
  ({
    row,
    style,
    panOffset,
    pixelsPerDay,
    timelineStart,
    totalWidth,
    selectedTareaId,
    onHover,
    onRightClick,
    onDoubleClick,
  }: GanttRowProps) => {
    const bgClass =
      row.type === 'frente' ? FRENTE_BG : row.type === 'sector' ? SECTOR_BG : TAREA_BG;

    return (
      // Use style from react-window (includes correct height for this row type)
      <div
        style={style}
        className={`border-b border-gray-100 dark:border-gray-700/50 ${bgClass} overflow-hidden`}
      >
        <div
          className="relative h-full"
          style={{ width: totalWidth, transform: `translateX(-${panOffset}px)` }}
        >
          {row.type === 'tarea' && (
            <GanttBar
              tarea={row.tarea}
              timelineStart={timelineStart}
              pixelsPerDay={pixelsPerDay}
              rowHeight={typeof style.height === 'number' ? style.height : 52}
              isSelected={selectedTareaId === row.tarea.id}
              onHover={onHover}
              onRightClick={onRightClick}
              onDoubleClick={onDoubleClick}
            />
          )}
        </div>
      </div>
    );
  },
);
