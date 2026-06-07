import { memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvatarColor, getInitials } from '../../utils/avatarHelpers';
import { BOTTOM_PANEL_HEIGHT } from '../../utils/constants';
import type { ITarea, IRestriccion, Prioridad } from '../../types';

// ---------- Style maps ----------

const TIPO_COLOR: Record<string, string> = {
  predecesora: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  recurso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'fecha limite': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const TIPO_LABEL: Record<string, string> = {
  predecesora: 'Pred.',
  recurso: 'Rec.',
  'fecha limite': 'F.Lím.',
};

const PRIORIDAD_COLOR: Record<Prioridad, string> = {
  sin_prioridad: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  alta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  critica: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  sin_prioridad: 'Sin',
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
};

const AVANCE_BG = (pct: number) =>
  pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';

// ---------- Sub-components ----------

const MiniAvatars = memo(({ miembros }: { miembros: string[] }) => {
  const max = 2;
  const visible = miembros.slice(0, max);
  const overflow = miembros.length - max;
  return (
    <div className="flex items-center gap-0.5" title={miembros.join(', ')}>
      {visible.map((name) => (
        <span
          key={name}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: getAvatarColor(name) }}
        >
          {getInitials(name)}
        </span>
      ))}
      {overflow > 0 && (
        <span className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          +{overflow}
        </span>
      )}
    </div>
  );
});

const fmtDate = (d: Date | null) =>
  d ? format(d, 'dd/MM/yy', { locale: es }) : '—';

const RestriccionRow = memo(
  ({ r, even }: { r: IRestriccion; even: boolean }) => {
    const rowBg = even
      ? 'bg-white dark:bg-gray-900'
      : 'bg-gray-50 dark:bg-gray-800/50';
    const avancePct = Math.min(r.avance, 100);

    return (
      <tr className={`${rowBg} border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20`}>
        {/* Proyecto */}
        <td className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap max-w-[110px] truncate" title={r.proyecto}>
          {r.proyecto}
        </td>

        {/* Restricción (badge tipo + nombre sin truncar) */}
        <td className="px-3 py-1.5">
          <div className="flex items-start gap-1.5 flex-wrap">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TIPO_COLOR[r.tipo] ?? ''}`}>
              {TIPO_LABEL[r.tipo] ?? r.tipo}
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium break-words min-w-0">
              {r.nombre}
            </span>
          </div>
        </td>

        {/* Descripción: máx 2 líneas o vacío */}
        <td className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
          {r.descripcion ? (
            <span className="line-clamp-2 leading-snug" title={r.descripcion}>{r.descripcion}</span>
          ) : null}
        </td>

        {/* Miembros: avatares o vacío */}
        <td className="px-3 py-1.5 whitespace-nowrap">
          {r.miembros.length > 0 ? <MiniAvatars miembros={r.miembros} /> : null}
        </td>

        {/* Inicio */}
        <td className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono">
          {fmtDate(r.fechaInicio)}
        </td>

        {/* Fin */}
        <td className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono">
          {fmtDate(r.fechaFin)}
        </td>

        {/* Fin Real */}
        <td className="px-3 py-1.5 text-xs whitespace-nowrap font-mono">
          {r.fechaFinReal ? (
            <span className="text-green-600 dark:text-green-400">{fmtDate(r.fechaFinReal)}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>

        {/* Prioridad */}
        <td className="px-3 py-1.5 whitespace-nowrap">
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORIDAD_COLOR[r.prioridad]}`}>
            {PRIORIDAD_LABEL[r.prioridad]}
          </span>
        </td>

        {/* Avance */}
        <td className="px-3 py-1.5 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full ${AVANCE_BG(avancePct)} transition-all`}
                style={{ width: `${avancePct}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 shrink-0">{avancePct}%</span>
          </div>
        </td>
      </tr>
    );
  },
);

// ---------- Main component ----------

const COLS = [
  { label: 'Proyecto',    width: '15%' },
  { label: 'Restricción', width: '25%' },
  { label: 'Descripción', width: '20%' },
  { label: 'Miembros',    width: '10%' },
  { label: 'Inicio',      width: '8%'  },
  { label: 'Fin',         width: '8%'  },
  { label: 'Fin Real',    width: '8%'  },
  { label: 'Prioridad',   width: '8%'  },
  { label: 'Avance',      width: '8%'  },
];

interface ConstraintsTableProps {
  selectedTarea: ITarea | null;
  selectedTareaPath: string | null;
}

export const ConstraintsTable = memo(({ selectedTarea, selectedTareaPath }: ConstraintsTableProps) => (
  <div
    className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col"
    style={{ height: BOTTOM_PANEL_HEIGHT }}
    aria-label="Panel de restricciones"
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0 min-h-[38px]">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 shrink-0">
          Restricciones
        </h2>
        {selectedTareaPath && (
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate" title={selectedTareaPath}>
            — {selectedTareaPath}
          </span>
        )}
      </div>
      {selectedTarea && (
        <span className="text-xs text-gray-400 shrink-0 ml-2">
          {selectedTarea.restricciones.length} restricción(es)
        </span>
      )}
    </div>

    {/* Content */}
    {!selectedTarea ? (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Clic derecho en una barra para ver sus restricciones
      </div>
    ) : selectedTarea.restricciones.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        Esta tarea no tiene restricciones definidas
      </div>
    ) : (
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }} role="table" aria-label="Tabla de restricciones">
          <colgroup>
            {COLS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
          </colgroup>
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.label}
                  className="px-3 py-1.5 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedTarea.restricciones.map((r, i) => (
              <RestriccionRow key={r.id} r={r} even={i % 2 === 0} />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
));
