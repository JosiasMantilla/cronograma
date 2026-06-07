import { memo } from 'react';
import { formatDate } from '../../utils/dateHelpers';
import type { ITarea } from '../../types';

interface TareaDetailsProps {
  tarea: ITarea;
  depth: number;
}

export const TareaDetails = memo(({ tarea, depth }: TareaDetailsProps) => {
  const isInvalid = tarea.fechaFin < tarea.fechaInicio;
  const pct = Math.min(tarea.porcentajeAvance, 100);

  const progressBg = isInvalid
    ? 'bg-red-500'
    : pct >= 100
      ? 'bg-green-500'
      : pct >= 50
        ? 'bg-amber-400'
        : 'bg-red-400';

  return (
    <div
      className="flex flex-col justify-center h-full py-1.5 overflow-hidden"
      style={{ paddingLeft: depth * 16 + 8, paddingRight: 8 }}
    >
      {/* Line 1: task name */}
      <div className="flex items-start gap-1 min-w-0">
        <span className="text-gray-400 dark:text-gray-500 shrink-0 text-xs leading-5">▪</span>
        <span className="text-gray-800 dark:text-gray-100 text-sm font-medium leading-snug flex-1 min-w-0 break-words">
          {tarea.nombre}
        </span>
      </div>

      {/* Line 2: dates · duration · progress */}
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400" style={{ marginLeft: depth * 16 + 16 }}>
        <span className="shrink-0 font-mono">
          {formatDate(tarea.fechaInicio, 'dd/MM')}→{formatDate(tarea.fechaFin, 'dd/MM')}
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="shrink-0">{tarea.duracionDias}d</span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex-1 max-w-[44px] h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full rounded-full ${progressBg} transition-all`}
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="shrink-0 font-medium">{pct}%</span>
        </div>
      </div>
    </div>
  );
});
