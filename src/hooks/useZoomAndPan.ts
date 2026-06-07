import { useCallback, useRef } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { clamp, computeMaxPanOffset } from '../utils/ganttHelpers';
import { MIN_PIXELS_PER_DAY, MAX_PIXELS_PER_DAY, PAN_STEP } from '../utils/constants';

interface UseZoomAndPanArgs {
  pixelsPerDay: number;
  setPixelsPerDay: (ppd: number | ((prev: number) => number)) => void;
  panOffset: number;
  setPanOffset: (offset: number | ((prev: number) => number)) => void;
  totalTimelineWidth: number;
  ganttViewWidth: number;
  timelineStart: Date;
}

export function useZoomAndPan({
  pixelsPerDay,
  setPixelsPerDay,
  panOffset,
  setPanOffset,
  totalTimelineWidth,
  ganttViewWidth,
  timelineStart,
}: UseZoomAndPanArgs) {
  const isPanning = useRef(false);
  const panStartX = useRef(0);
  const panStartOffset = useRef(0);

  const maxOffset = computeMaxPanOffset(totalTimelineWidth, ganttViewWidth);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      setPixelsPerDay((prev) => clamp(prev * factor, MIN_PIXELS_PER_DAY, MAX_PIXELS_PER_DAY));
    },
    [setPixelsPerDay],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 2) return;
      e.preventDefault();
      isPanning.current = true;
      panStartX.current = e.clientX;
      panStartOffset.current = panOffset;

      const onMove = (me: MouseEvent) => {
        if (!isPanning.current) return;
        const delta = panStartX.current - me.clientX;
        setPanOffset(clamp(panStartOffset.current + delta, 0, maxOffset));
      };

      const onUp = () => {
        isPanning.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [panOffset, setPanOffset, maxOffset],
  );

  const panLeft = useCallback(() => {
    setPanOffset((prev) => clamp(prev - PAN_STEP, 0, maxOffset));
  }, [setPanOffset, maxOffset]);

  const panRight = useCallback(() => {
    setPanOffset((prev) => clamp(prev + PAN_STEP, 0, maxOffset));
  }, [setPanOffset, maxOffset]);

  const goToToday = useCallback(() => {
    const todayOffset =
      differenceInCalendarDays(new Date(), timelineStart) * pixelsPerDay - ganttViewWidth / 2;
    setPanOffset(clamp(todayOffset, 0, maxOffset));
  }, [timelineStart, pixelsPerDay, ganttViewWidth, setPanOffset, maxOffset]);

  return {
    handleWheel,
    handleMouseDown,
    panLeft,
    panRight,
    goToToday,
    canPanLeft: panOffset > 0,
    canPanRight: panOffset < maxOffset,
  };
}
