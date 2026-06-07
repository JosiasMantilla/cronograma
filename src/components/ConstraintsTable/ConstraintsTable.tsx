import { memo } from 'react';
import { BOTTOM_PANEL_HEIGHT } from '../../utils/constants';
import type { ITarea } from '../../types';

const TIPO_LABEL: Record<string, string> = {
  predecesora: 'Predecesora',
  recurso: 'Recurso',
  'fecha limite': 'Fecha Límite',
};

const TIPO_COLOR: Record<string, string> = {
  predecesora: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  recurso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'fecha limite': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface ConstraintsTableProps {
  selectedTarea: ITarea | null;
}

export const ConstraintsTable = memo(({ selectedTarea }: ConstraintsTableProps) => (
  <div
    className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col"
    style={{ height: BOTTOM_PANEL_HEIGHT }}
    aria-label="Panel de restricciones"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Restricciones
        {selectedTarea && (
          <span className="ml-2 font-normal text-gray-500 dark:text-gray-400 truncate max-w-xs inline-block align-bottom">
            — {selectedTarea.nombre}
          </span>
        )}
      </h2>
      {selectedTarea && (
        <span className="text-xs text-gray-400">
          {selectedTarea.restricciones.length} restricción(es)
        </span>
      )}
    </div>

    {/* Content */}
    {!selectedTarea ? (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Seleccione una tarea con clic derecho para ver sus restricciones
      </div>
    ) : selectedTarea.restricciones.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Esta tarea no tiene restricciones definidas
      </div>
    ) : (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm" role="table" aria-label="Tabla de restricciones">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Tipo', 'Descripción', 'Valor'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedTarea.restricciones.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-gray-100 dark:border-gray-700/50 ${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
                } hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[r.tipo] ?? ''}`}
                  >
                    {TIPO_LABEL[r.tipo] ?? r.tipo}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{r.descripcion}</td>
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {r.valor ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
));
