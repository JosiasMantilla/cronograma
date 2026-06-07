import { memo, useCallback } from 'react';
import { MIN_PIXELS_PER_DAY, MAX_PIXELS_PER_DAY } from '../../utils/constants';
import { getZoomLevelFromPixels } from '../../utils/ganttHelpers';

interface ZoomSliderProps {
  pixelsPerDay: number;
  onChange: (ppd: number) => void;
}

const toSlider = (ppd: number): number =>
  Math.round(
    ((Math.log(ppd) - Math.log(MIN_PIXELS_PER_DAY)) /
      (Math.log(MAX_PIXELS_PER_DAY) - Math.log(MIN_PIXELS_PER_DAY))) *
      100,
  );

const fromSlider = (val: number): number =>
  Math.round(
    Math.exp(
      Math.log(MIN_PIXELS_PER_DAY) +
        (val / 100) * (Math.log(MAX_PIXELS_PER_DAY) - Math.log(MIN_PIXELS_PER_DAY)),
    ),
  );

const ZOOM_LABELS: Record<string, string> = {
  anual: 'Anual',
  semestral: 'Semestral',
  trimestral: 'Trimestral',
  mensual: 'Mensual',
  semanal: 'Semanal',
  diaria: 'Diaria',
};

export const ZoomSlider = memo(({ pixelsPerDay, onChange }: ZoomSliderProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(fromSlider(Number(e.target.value)));
    },
    [onChange],
  );

  const zoomLevel = getZoomLevelFromPixels(pixelsPerDay);

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right shrink-0">
        {ZOOM_LABELS[zoomLevel]}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={toSlider(pixelsPerDay)}
        onChange={handleChange}
        aria-label="Zoom del cronograma"
        className="w-24 h-1.5 accent-blue-600 cursor-pointer"
      />
    </div>
  );
});
