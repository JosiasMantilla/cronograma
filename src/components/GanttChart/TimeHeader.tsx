import { memo, useMemo } from 'react';
import { getMajorUnits, getMinorUnits } from '../../utils/dateHelpers';
import { HEADER_HEIGHT } from '../../utils/constants';
import type { ZoomLevel } from '../../types';

interface TimeHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  pixelsPerDay: number;
  panOffset: number;
  zoomLevel: ZoomLevel;
  totalWidth: number;
}

export const TimeHeader = memo(
  ({ timelineStart, timelineEnd, pixelsPerDay, panOffset, zoomLevel, totalWidth }: TimeHeaderProps) => {
    const majorUnits = useMemo(
      () => getMajorUnits(timelineStart, timelineEnd, pixelsPerDay, zoomLevel),
      [timelineStart, timelineEnd, pixelsPerDay, zoomLevel],
    );

    const minorUnits = useMemo(
      () => getMinorUnits(timelineStart, timelineEnd, pixelsPerDay, zoomLevel),
      [timelineStart, timelineEnd, pixelsPerDay, zoomLevel],
    );

    const rowH = HEADER_HEIGHT / 2;

    return (
      <div
        className="overflow-hidden shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative"
        style={{ height: HEADER_HEIGHT }}
        role="rowgroup"
        aria-label="Cabecera de tiempo"
      >
        <div
          className="absolute top-0 left-0"
          style={{ width: totalWidth, transform: `translateX(-${panOffset}px)` }}
        >
          {/* Major row */}
          <div className="relative border-b border-gray-200 dark:border-gray-700" style={{ height: rowH }}>
            {majorUnits.map((u, i) => (
              <div
                key={i}
                className="absolute top-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200 overflow-hidden border-r border-gray-200 dark:border-gray-600"
                style={{ left: u.startPx, width: u.widthPx, height: rowH }}
                title={u.label}
              >
                <span className="truncate px-1">{u.label}</span>
              </div>
            ))}
          </div>
          {/* Minor row */}
          <div className="relative" style={{ height: rowH }}>
            {minorUnits.map((u, i) => (
              <div
                key={i}
                className="absolute top-0 flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 overflow-hidden border-r border-gray-200 dark:border-gray-600"
                style={{ left: u.startPx, width: u.widthPx, height: rowH }}
                title={u.label}
              >
                <span className="truncate px-0.5">{u.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
