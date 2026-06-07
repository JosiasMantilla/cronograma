import { memo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { HEADER_HEIGHT } from '../../utils/constants';

interface TodayLineProps {
  timelineStart: Date;
  pixelsPerDay: number;
  panOffset: number;
  totalHeight: number;
}

export const TodayLine = memo(
  ({ timelineStart, pixelsPerDay, panOffset, totalHeight }: TodayLineProps) => {
    const today = new Date();
    const daysDiff = differenceInCalendarDays(today, timelineStart);
    const x = daysDiff * pixelsPerDay - panOffset;

    if (x < 0) return null;

    return (
      <>
        {/* Label */}
        <div
          aria-hidden="true"
          className="absolute top-0 z-20 pointer-events-none"
          style={{ left: x - 16, height: HEADER_HEIGHT }}
        >
          <span className="absolute bottom-1 left-0 text-[10px] font-bold text-red-500 whitespace-nowrap">
            HOY
          </span>
        </div>
        {/* Line */}
        <div
          aria-label="Línea de fecha actual"
          className="absolute top-0 z-20 w-0.5 bg-red-500 pointer-events-none"
          style={{ left: x, height: totalHeight }}
        />
      </>
    );
  },
);
