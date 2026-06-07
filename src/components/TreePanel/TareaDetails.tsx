import { memo } from 'react';
import { formatDate } from '../../utils/dateHelpers';
import type { ITarea } from '../../types';

interface TareaDetailsProps {
  tarea: ITarea;
  depth: number;
}

export const TareaDetails = memo(({ tarea, depth }: TareaDetailsProps) => {
  const isInvalid = tarea.fechaFin < tarea.fechaInicio;
  const progressColor =
    isInvalid
      ? 'bg-red-600'
      : tarea.porcentajeAvance >= 100
        ? 'bg-green-500'
        : tarea.porcentajeAvance >= 50
          ? 'bg-amber-400'
          : 'bg-red-500';

  return (
    <div
      className="flex items-center h-full text-xs gap-1 pr-1 overflow-hidden"
      style={{ paddingLeft: depth * 16 + 8 }}
    >
      {/* Task icon */}
      <span className="text-gray-400 dark:text-gray-500 shrink-0">▪</span>

      {/* Name */}
      <span
        className="text-gray-800 dark:text-gray-100 truncate flex-1 min-w-0"
        title={tarea.nombre}
      >
        {tarea.nombre}
      </span>

      {/* Members */}
      <span
        className="text-gray-500 dark:text-gray-400 shrink-0 w-16 truncate text-center"
        title={tarea.integrantes.length > 0 ? tarea.integrantes.join(', ') : 'Sin asignar'}
      >
        {tarea.integrantes.length > 0 ? tarea.integrantes[0] : 'Sin asignar'}
      </span>

      {/* Start */}
      <span className="text-gray-600 dark:text-gray-300 shrink-0 w-16 text-center">
        {formatDate(tarea.fechaInicio, 'dd/MM')}
      </span>

      {/* End */}
      <span
        className={`shrink-0 w-16 text-center ${isInvalid ? 'text-red-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
      >
        {formatDate(tarea.fechaFin, 'dd/MM')}
      </span>

      {/* Duration */}
      <span className="text-gray-500 dark:text-gray-400 shrink-0 w-8 text-center">
        {tarea.duracionDias}d
      </span>

      {/* Progress bar */}
      <div className="shrink-0 w-14 flex flex-col gap-0.5">
        <span className="text-center text-gray-600 dark:text-gray-300 leading-none">
          {tarea.porcentajeAvance}%
        </span>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColor} transition-all`}
            style={{ width: `${Math.min(tarea.porcentajeAvance, 100)}%` }}
            role="progressbar"
            aria-valuenow={tarea.porcentajeAvance}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
});
