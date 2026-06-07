import { useState, useMemo, useCallback } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { mockData } from '../data/mockData';
import { useLocalStorage } from './useLocalStorage';
import { getTimelineRange } from '../utils/dateHelpers';
import { getTareaEstado } from '../utils/avatarHelpers';
import { PIXELS_PER_DAY_MAP, TIMELINE_BUFFER_DAYS } from '../utils/constants';
import type { IFrente, ITarea, IRow, IEditTareaPayload, IAddTareaPayload, IFilterState } from '../types';

const DEFAULT_FILTERS: IFilterState = { search: '', frenteId: '', sectorId: '', estado: 'all' };

export function useGanttData() {
  const [frentes, setFrentes] = useState<IFrente[]>(mockData);
  const [expandedIds, setExpandedIds] = useLocalStorage<string[]>('gantt_expanded', []);
  const [pixelsPerDay, setPixelsPerDay] = useLocalStorage<number>('gantt_ppd', PIXELS_PER_DAY_MAP.mensual);
  const [panOffset, setPanOffset] = useLocalStorage<number>('gantt_pan', 0);
  const [hideSectors, setHideSectors] = useLocalStorage<boolean>('gantt_hideSectors', false);
  const [hideTasks, setHideTasks] = useLocalStorage<boolean>('gantt_hideTasks', false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('gantt_dark', false);
  const [filterState, setFilterState] = useLocalStorage<IFilterState>('gantt_filters', DEFAULT_FILTERS);
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

  const baseVisibleRows = useMemo<IRow[]>(() => {
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

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filterState.search) ||
      Boolean(filterState.frenteId) ||
      Boolean(filterState.sectorId) ||
      filterState.estado !== 'all',
    [filterState],
  );

  const visibleRows = useMemo<IRow[]>(() => {
    if (!hasActiveFilters) return baseVisibleRows;

    const rows: IRow[] = [];
    const shownFrentes = new Set<string>();
    const shownSectors = new Set<string>();

    for (const frente of frentes) {
      if (filterState.frenteId && frente.id !== filterState.frenteId) continue;

      for (const sector of frente.sectores) {
        if (filterState.sectorId && sector.id !== filterState.sectorId) continue;

        for (const tarea of sector.tareas) {
          if (
            filterState.search &&
            !tarea.nombre.toLowerCase().includes(filterState.search.toLowerCase())
          )
            continue;
          if (filterState.estado !== 'all' && getTareaEstado(tarea) !== filterState.estado)
            continue;

          if (!shownFrentes.has(frente.id)) {
            rows.push({ type: 'frente', id: frente.id, depth: 0, frente, isExpanded: true });
            shownFrentes.add(frente.id);
          }
          if (!hideSectors && !shownSectors.has(sector.id)) {
            rows.push({ type: 'sector', id: sector.id, depth: 1, frente, sector, isExpanded: true });
            shownSectors.add(sector.id);
          }
          const depth = hideSectors ? 1 : 2;
          rows.push({ type: 'tarea', id: tarea.id, depth, frente, sector, tarea });
        }
      }
    }

    return rows;
  }, [frentes, baseVisibleRows, hasActiveFilters, filterState, hideSectors]);

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

  const updateMembers = useCallback((tareaId: string, members: string[]) => {
    setFrentes((prev) =>
      prev.map((f) => ({
        ...f,
        sectores: f.sectores.map((s) => ({
          ...s,
          tareas: s.tareas.map((t) =>
            t.id === tareaId ? { ...t, integrantes: members } : t,
          ),
        })),
      })),
    );
  }, []);

  const addTarea = useCallback(
    (frenteId: string, sectorId: string, payload: IAddTareaPayload) => {
      const newTarea: ITarea = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nombre: payload.nombre,
        fechaInicio: payload.fechaInicio,
        fechaFin: payload.fechaFin,
        duracionDias: Math.max(1, differenceInCalendarDays(payload.fechaFin, payload.fechaInicio) + 1),
        porcentajeAvance: payload.porcentajeAvance,
        integrantes: payload.integrantes,
        restricciones: [],
      };

      setFrentes((prev) =>
        prev.map((f) =>
          f.id !== frenteId
            ? f
            : {
                ...f,
                sectores: f.sectores.map((s) =>
                  s.id !== sectorId ? s : { ...s, tareas: [...s.tareas, newTarea] },
                ),
              },
        ),
      );

      setExpandedIds((prev) => {
        const set = new Set(prev);
        set.add(frenteId);
        set.add(sectorId);
        return Array.from(set);
      });
    },
    [setExpandedIds],
  );

  const clearFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTERS);
  }, [setFilterState]);

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
    filterState,
    setFilterState,
    clearFilters,
    hasActiveFilters,
    timelineStart,
    timelineEnd,
    totalTimelineWidth,
    toggleExpanded,
    selectTarea: setSelectedTareaId,
    openEdit: setEditingTareaId,
    closeEdit: () => setEditingTareaId(null),
    updateTarea,
    updateMembers,
    addTarea,
    setCronogramaGeneral,
    setCronogramaEspecifico,
  };
}
