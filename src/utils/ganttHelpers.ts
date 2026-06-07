import { differenceInCalendarDays } from 'date-fns';
import { PIXELS_PER_DAY_MAP, ZOOM_LEVELS } from './constants';
import type { ZoomLevel } from '../types';

export function dateToPixel(date: Date, timelineStart: Date, pixelsPerDay: number): number {
  return differenceInCalendarDays(date, timelineStart) * pixelsPerDay;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getZoomLevelFromPixels(ppd: number): ZoomLevel {
  let closest: ZoomLevel = 'mensual';
  let minDiff = Infinity;
  for (const level of ZOOM_LEVELS) {
    const diff = Math.abs(PIXELS_PER_DAY_MAP[level] - ppd);
    if (diff < minDiff) {
      minDiff = diff;
      closest = level;
    }
  }
  return closest;
}

export function getBarColor(porcentajeAvance: number, isInvalid: boolean): string {
  if (isInvalid) return 'bg-red-600 border-2 border-black dark:border-white';
  if (porcentajeAvance >= 100) return 'bg-green-500';
  if (porcentajeAvance >= 50) return 'bg-amber-400';
  return 'bg-red-500';
}

export function isDelayed(fechaFin: Date, porcentajeAvance: number): boolean {
  return fechaFin < new Date() && porcentajeAvance < 100;
}

export function computeMaxPanOffset(
  totalTimelineWidth: number,
  ganttViewWidth: number,
): number {
  return Math.max(0, totalTimelineWidth - ganttViewWidth);
}
