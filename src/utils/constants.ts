import type { ZoomLevel } from '../types';

export const PIXELS_PER_DAY_MAP: Record<ZoomLevel, number> = {
  anual: 3,
  semestral: 6,
  trimestral: 12,
  mensual: 24,
  semanal: 60,
  diaria: 120,
};

export const ZOOM_LEVELS: ZoomLevel[] = [
  'anual',
  'semestral',
  'trimestral',
  'mensual',
  'semanal',
  'diaria',
];

export const ROW_HEIGHT = 52;
export const TAREA_ROW_HEIGHT = 64;
export const HEADER_HEIGHT = 56;
export const LEFT_PANEL_WIDTH = 440;
export const BOTTOM_PANEL_HEIGHT = 190;
export const TOOLBAR_HEIGHT = 56;

export const PAN_STEP = 200;
export const TIMELINE_BUFFER_DAYS = 30;

export const MIN_PIXELS_PER_DAY = 1;
export const MAX_PIXELS_PER_DAY = 150;

export const LS_KEY = 'gantt_v1';

export const SECTOR_ROW_HEIGHT = 70;