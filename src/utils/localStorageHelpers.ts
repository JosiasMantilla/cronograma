import { LS_KEY } from './constants';

interface PersistedState {
  expandedIds: string[];
  pixelsPerDay: number;
  panOffset: number;
  hideSectors: boolean;
  hideTasks: boolean;
  isDarkMode: boolean;
}

export function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return {};
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}
