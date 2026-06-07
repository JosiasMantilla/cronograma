import type { ITarea, TaskEstado } from '../types';

const AVATAR_PALETTE = [
  '#EF4444','#F97316','#F59E0B','#84CC16',
  '#22C55E','#14B8A6','#3B82F6','#8B5CF6',
  '#EC4899','#06B6D4','#6366F1','#A855F7',
  '#10B981','#F43F5E','#0EA5E9','#D97706',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function getTareaEstado(tarea: ITarea): TaskEstado {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (tarea.porcentajeAvance >= 100) return 'completada';
  if (tarea.porcentajeAvance === 0 && tarea.fechaInicio > today) return 'no_iniciada';
  if (tarea.fechaFin < today && tarea.porcentajeAvance < 100) return 'atrasada';
  if (tarea.porcentajeAvance === 0) return 'no_iniciada';
  return 'en_progreso';
}

export const ESTADO_LABEL: Record<string, string> = {
  completada: 'Completada',
  en_progreso: 'En progreso',
  no_iniciada: 'No iniciada',
  atrasada: 'Atrasada',
};

export const ESTADO_COLOR: Record<string, string> = {
  completada: 'text-green-600 dark:text-green-400',
  en_progreso: 'text-blue-600 dark:text-blue-400',
  no_iniciada: 'text-gray-500 dark:text-gray-400',
  atrasada: 'text-red-600 dark:text-red-400',
};
