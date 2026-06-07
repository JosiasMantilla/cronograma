import { memo } from 'react';
import { formatDate } from '../../utils/dateHelpers';
import type { ITooltipState } from '../../types';

interface CustomTooltipProps {
  tooltip: ITooltipState;
  containerRect: DOMRect | null;
}

export const CustomTooltip = memo(({ tooltip, containerRect }: CustomTooltipProps) => {
  const { tarea, x, y } = tooltip;
  const isInvalid = tarea.fechaFin < tarea.fechaInicio;

  const left = containerRect
    ? Math.min(x - containerRect.left + 12, containerRect.width - 260)
    : x + 12;
  const top = containerRect ? y - containerRect.top - 10 : y - 10;

  return (
    <div
      role="tooltip"
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 w-60 text-sm pointer-events-none"
      style={{ left, top }}
    >
      <p className="font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
        {tarea.nombre}
      </p>
      {isInvalid && (
        <p className="text-red-600 font-medium mb-1">⚠ Fechas inválidas</p>
      )}
      <div className="space-y-1 text-gray-600 dark:text-gray-300">
        <p>
          <span className="font-medium">Inicio:</span> {formatDate(tarea.fechaInicio)}
        </p>
        <p>
          <span className="font-medium">Fin:</span> {formatDate(tarea.fechaFin)}
        </p>
        <p>
          <span className="font-medium">Duración:</span> {tarea.duracionDias}d
        </p>
        <p>
          <span className="font-medium">Avance:</span> {tarea.porcentajeAvance}%
        </p>
        <p>
          <span className="font-medium">Integrantes:</span>{' '}
          {tarea.integrantes.length > 0 ? tarea.integrantes.join(', ') : 'Sin asignar'}
        </p>
      </div>
    </div>
  );
});
