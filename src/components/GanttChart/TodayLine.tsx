import { memo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { HEADER_HEIGHT } from '../../utils/constants';

interface TodayLineProps {
  timelineStart: Date;
  pixelsPerDay: number;
  panOffset: number;
  totalHeight: number;
  cutDate?: Date;
}

export const TodayLine = memo(
  ({ timelineStart, pixelsPerDay, panOffset, totalHeight, cutDate }: TodayLineProps) => {
    const date = cutDate ?? new Date();
    const daysDiff = differenceInCalendarDays(date, timelineStart);
    const x = daysDiff * pixelsPerDay - panOffset;
    const isCut = cutDate !== undefined;

    if (x < 0) return null;

    return (
      <>
        <div
          aria-hidden="true"
          className="absolute top-0 z-20 pointer-events-none"
          style={{ left: x - 20, height: HEADER_HEIGHT }}
        >
          <span
            className={`absolute bottom-1 left-0 text-[10px] font-bold whitespace-nowrap ${isCut ? 'text-orange-500' : 'text-red-500'}`}
          >
            {isCut ? 'CORTE' : 'HOY'}
          </span>
        </div>
        <div
          aria-label={isCut ? 'Línea de corte' : 'Línea de fecha actual'}
          className={`absolute top-0 z-20 w-0.5 pointer-events-none ${isCut ? 'bg-orange-500' : 'bg-red-500'}`}
          style={{ left: x, height: totalHeight }}
        />
      </>
    );
  },
);
