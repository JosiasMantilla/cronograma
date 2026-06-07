import {
  format,
  differenceInCalendarDays,
  addDays,
  startOfWeek,
  endOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { IFrente, ITimeHeaderUnit, ZoomLevel } from '../types';

export function formatDate(date: Date, pattern = 'dd/MM/yyyy'): string {
  return format(date, pattern, { locale: es });
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function daysBetween(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function getTimelineRange(frentes: IFrente[]): { start: Date; end: Date } {
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  for (const frente of frentes) {
    for (const sector of frente.sectores) {
      for (const tarea of sector.tareas) {
        if (!minDate || tarea.fechaInicio < minDate) minDate = tarea.fechaInicio;
        if (!maxDate || tarea.fechaFin > maxDate) maxDate = tarea.fechaFin;
      }
    }
  }

  const base = new Date();
  return {
    start: addDays(minDate ?? base, -30),
    end: addDays(maxDate ?? base, 30),
  };
}

export function getMajorUnits(
  timelineStart: Date,
  timelineEnd: Date,
  pixelsPerDay: number,
  zoomLevel: ZoomLevel,
): ITimeHeaderUnit[] {
  const units: ITimeHeaderUnit[] = [];

  if (zoomLevel === 'diaria' || zoomLevel === 'semanal') {
    // Major: months
    let cur = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    while (cur <= timelineEnd) {
      const mEnd = endOfMonth(cur);
      const clippedEnd = mEnd < timelineEnd ? mEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      units.push({ label: format(cur, 'MMMM yyyy', { locale: es }), startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  } else if (zoomLevel === 'mensual') {
    // Major: quarters
    let cur = new Date(timelineStart.getFullYear(), Math.floor(timelineStart.getMonth() / 3) * 3, 1);
    while (cur <= timelineEnd) {
      const qEnd = new Date(cur.getFullYear(), cur.getMonth() + 3, 0);
      const clippedEnd = qEnd < timelineEnd ? qEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      const q = Math.floor(cur.getMonth() / 3) + 1;
      units.push({ label: `T${q} ${cur.getFullYear()}`, startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
    }
  } else if (zoomLevel === 'trimestral') {
    // Major: semesters
    let cur = new Date(timelineStart.getFullYear(), Math.floor(timelineStart.getMonth() / 6) * 6, 1);
    while (cur <= timelineEnd) {
      const sEnd = new Date(cur.getFullYear(), cur.getMonth() + 6, 0);
      const clippedEnd = sEnd < timelineEnd ? sEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      const sem = cur.getMonth() < 6 ? 'I' : 'II';
      units.push({ label: `${sem} Sem. ${cur.getFullYear()}`, startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 6, 1);
    }
  } else {
    // semestral / anual: Major = years
    let cur = new Date(timelineStart.getFullYear(), 0, 1);
    while (cur <= timelineEnd) {
      const yEnd = new Date(cur.getFullYear(), 11, 31);
      const clippedEnd = yEnd < timelineEnd ? yEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      units.push({ label: format(cur, 'yyyy'), startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear() + 1, 0, 1);
    }
  }

  return units;
}

export function getMinorUnits(
  timelineStart: Date,
  timelineEnd: Date,
  pixelsPerDay: number,
  zoomLevel: ZoomLevel,
): ITimeHeaderUnit[] {
  const units: ITimeHeaderUnit[] = [];

  if (zoomLevel === 'diaria') {
    // Minor: days
    let cur = new Date(timelineStart);
    while (cur <= timelineEnd) {
      const startPx = differenceInCalendarDays(cur, timelineStart) * pixelsPerDay;
      units.push({
        label: format(cur, 'd', { locale: es }),
        startPx,
        widthPx: pixelsPerDay,
      });
      cur = addDays(cur, 1);
    }
  } else if (zoomLevel === 'semanal') {
    // Minor: weeks
    let cur = startOfWeek(timelineStart, { weekStartsOn: 1 });
    while (cur <= timelineEnd) {
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const wEnd = addDays(cur, 6);
      const clippedEnd = wEnd < timelineEnd ? wEnd : timelineEnd;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      units.push({
        label: `S${format(cur, 'ww')} ${format(cur, 'dd/MM')}`,
        startPx,
        widthPx: endPx - startPx,
      });
      cur = addDays(cur, 7);
    }
  } else if (zoomLevel === 'mensual') {
    // Minor: months
    let cur = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    while (cur <= timelineEnd) {
      const mEnd = endOfMonth(cur);
      const clippedEnd = mEnd < timelineEnd ? mEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      units.push({ label: format(cur, 'MMM', { locale: es }), startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  } else if (zoomLevel === 'trimestral') {
    // Minor: months
    let cur = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    while (cur <= timelineEnd) {
      const mEnd = endOfMonth(cur);
      const clippedEnd = mEnd < timelineEnd ? mEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      units.push({ label: format(cur, 'MMM', { locale: es }), startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  } else if (zoomLevel === 'semestral') {
    // Minor: quarters
    let cur = new Date(timelineStart.getFullYear(), Math.floor(timelineStart.getMonth() / 3) * 3, 1);
    while (cur <= timelineEnd) {
      const qEnd = new Date(cur.getFullYear(), cur.getMonth() + 3, 0);
      const clippedEnd = qEnd < timelineEnd ? qEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      const q = Math.floor(cur.getMonth() / 3) + 1;
      units.push({ label: `T${q}`, startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
    }
  } else {
    // anual: Minor = semesters
    let cur = new Date(timelineStart.getFullYear(), Math.floor(timelineStart.getMonth() / 6) * 6, 1);
    while (cur <= timelineEnd) {
      const sEnd = new Date(cur.getFullYear(), cur.getMonth() + 6, 0);
      const clippedEnd = sEnd < timelineEnd ? sEnd : timelineEnd;
      const startPx = Math.max(0, differenceInCalendarDays(cur, timelineStart)) * pixelsPerDay;
      const endPx = differenceInCalendarDays(clippedEnd, timelineStart) * pixelsPerDay + pixelsPerDay;
      const sem = cur.getMonth() < 6 ? 'S1' : 'S2';
      units.push({ label: sem, startPx, widthPx: endPx - startPx });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 6, 1);
    }
  }

  return units;
}
