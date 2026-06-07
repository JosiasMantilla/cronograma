import { useState, useMemo, useCallback } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { mockData } from '../data/mockData';
import { useLocalStorage } from './useLocalStorage';
import { getTimelineRange } from '../utils/dateHelpers';
import { PIXELS_PER_DAY_MAP, TIMELINE_BUFFER_DAYS } from '../utils/constants';
import type { IFrente, ITarea, IRow, IEditTareaPayload } from '../types';

export function useGanttData() {
  const [frentes, setFrentes] = useState<IFrente[]>(mockData);
  const [expandedIds, setExpandedIds] = useLocalStorage<string[]>('gantt_expanded', []);
  const [pixelsPerDay, setPixelsPerDay] = useLocalStorage<number>('gantt_ppd', PIXELS_PER_DAY_MAP.mensual);
  const [panOffset, setPanOffset] = useLocalStorage<number>('gantt_pan', 0);
  const [hideSectors, setHideSectors] = useLocalStorage<boolean>('gantt_hideSectors', false);
  const [hideTasks, setHideTasks] = useLocalStorage<boolean>('gantt_hideTasks', false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('gantt_dark', false);
  const [selectedTareaId, setSelectedTareaId] = useState<string | null>(null);
  const [editingTareaId, setEditingTareaId] = useState<string | null>(null);

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const { start: timelineStart, end: timelineEnd } = useMemo(
    () => getTimelineRange(frentes),
    [frentes],
  );

  const totalTimelineWidth = useMemo(
    () =>
      (differenceInCalendarDays(timelineEnd, timelineStart) + TIMELINE_BUFFER_DAYS) * pixelsPerDay,
    [timelineStart, timelineEnd, pixelsPerDay],
  );

  const visibleRows = useMemo<IRow[]>(() => {
    const rows: IRow[] = [];
    for (const frente of frentes) {
      const frenteExpanded = expandedSet.has(frente.id);
      rows.push({ type: 'frente', id: frente.id, depth: 0, frente, isExpanded: frenteExpanded });

      if (!frenteExpanded) continue;

      for (const sector of frente.sectores) {
        const sectorExpanded = expandedSet.has(sector.id);

        if (!hideSectors) {
          rows.push({
            type: 'sector',
            id: sector.id,
            depth: 1,
            frente,
            sector,
            isExpanded: sectorExpanded,
          });

          if (sectorExpanded && !hideTasks) {
            for (const tarea of sector.tareas) {
              rows.push({ type: 'tarea', id: tarea.id, depth: 2, frente, sector, tarea });
            }
          }
        } else if (!hideTasks) {
          for (const tarea of sector.tareas) {
            rows.push({ type: 'tarea', id: tarea.id, depth: 1, frente, sector, tarea });
          }
        }
      }
    }
    return rows;
  }, [frentes, expandedSet, hideSectors, hideTasks]);

  const selectedTarea = useMemo<ITarea | null>(() => {
    if (!selectedTareaId) return null;
    for (const f of frentes) {
      for (const s of f.sectores) {
        const t = s.tareas.find((x) => x.id === selectedTareaId);
        if (t) return t;
      }
    }
    return null;
  }, [frentes, selectedTareaId]);

  const editingTarea = useMemo<ITarea | null>(() => {
    if (!editingTareaId) return null;
    for (const f of frentes) {
      for (const s of f.sectores) {
        const t = s.tareas.find((x) => x.id === editingTareaId);
        if (t) return t;
      }
    }
    return null;
  }, [frentes, editingTareaId]);

  const toggleExpanded = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const set = new Set(prev);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        return Array.from(set);
      });
    },
    [setExpandedIds],
  );

  const updateTarea = useCallback(
    (tareaId: string, payload: IEditTareaPayload) => {
      setFrentes((prev) =>
        prev.map((f) => ({
          ...f,
          sectores: f.sectores.map((s) => ({
            ...s,
            tareas: s.tareas.map((t) =>
              t.id === tareaId
                ? {
                    ...t,
                    fechaInicio: payload.fechaInicio,
                    fechaFin: payload.fechaFin,
                    porcentajeAvance: payload.porcentajeAvance,
                    duracionDias:
                      differenceInCalendarDays(payload.fechaFin, payload.fechaInicio) + 1,
                  }
                : t,
            ),
          })),
        })),
      );
    },
    [],
  );

  const setCronogramaGeneral = useCallback(() => {
    setHideSectors(true);
    setHideTasks(false);
  }, [setHideSectors, setHideTasks]);

  const setCronogramaEspecifico = useCallback(() => {
    setHideSectors(false);
    setHideTasks(false);
  }, [setHideSectors, setHideTasks]);

  return {
    frentes,
    visibleRows,
    expandedSet,
    selectedTareaId,
    selectedTarea,
    editingTareaId,
    editingTarea,
    pixelsPerDay,
    setPixelsPerDay,
    panOffset,
    setPanOffset,
    hideSectors,
    setHideSectors,
    hideTasks,
    setHideTasks,
    isDarkMode,
    setIsDarkMode,
    timelineStart,
    timelineEnd,
    totalTimelineWidth,
    toggleExpanded,
    selectTarea: setSelectedTareaId,
    openEdit: setEditingTareaId,
    closeEdit: () => setEditingTareaId(null),
    updateTarea,
    setCronogramaGeneral,
    setCronogramaEspecifico,
  };
}
