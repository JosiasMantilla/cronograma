import {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
} from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { TimeHeader } from './TimeHeader';
import { TodayLine } from './TodayLine';
import { GanttRow } from './GanttRow';
import { CustomTooltip } from '../common/CustomTooltip';
import { getZoomLevelFromPixels } from '../../utils/ganttHelpers';
import { HEADER_HEIGHT, ROW_HEIGHT } from '../../utils/constants';
import type { IRow, ITarea, ITooltipState } from '../../types';
import type { FixedSizeList as FixedSizeListType } from 'react-window';

interface ItemData {
  rows: IRow[];
  panOffset: number;
  pixelsPerDay: number;
  timelineStart: Date;
  totalWidth: number;
  selectedTareaId: string | null;
  onHover: (tarea: ITarea | null, x: number, y: number) => void;
  onRightClick: (id: string) => void;
  onDoubleClick: (id: string) => void;
}

const RowRenderer = memo(({ index, style, data }: ListChildComponentProps<ItemData>) => {
  const row = data.rows[index];
  return (
    <GanttRow
      row={row}
      style={style as CSSProperties}
      panOffset={data.panOffset}
      pixelsPerDay={data.pixelsPerDay}
      timelineStart={data.timelineStart}
      totalWidth={data.totalWidth}
      selectedTareaId={data.selectedTareaId}
      onHover={data.onHover}
      onRightClick={data.onRightClick}
      onDoubleClick={data.onDoubleClick}
    />
  );
});

interface GanttChartProps {
  listRef: React.RefObject<FixedSizeListType | null>;
  rows: IRow[];
  panOffset: number;
  pixelsPerDay: number;
  timelineStart: Date;
  timelineEnd: Date;
  totalWidth: number;
  selectedTareaId: string | null;
  onScroll: (args: { scrollOffset: number }) => void;
  onWheelSetup: (el: HTMLElement) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onSelectTarea: (id: string) => void;
  onOpenEdit: (id: string) => void;
  height: number;
  width: number;
}

export const GanttChart = memo(
  ({
    listRef,
    rows,
    panOffset,
    pixelsPerDay,
    timelineStart,
    timelineEnd,
    totalWidth,
    selectedTareaId,
    onScroll,
    onWheelSetup,
    onMouseDown,
    onContextMenu,
    onSelectTarea,
    onOpenEdit,
    height,
    width,
  }: GanttChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<ITooltipState | null>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      onWheelSetup(el);
      const ro = new ResizeObserver(() => setContainerRect(el.getBoundingClientRect()));
      ro.observe(el);
      setContainerRect(el.getBoundingClientRect());
      return () => ro.disconnect();
    }, [onWheelSetup]);

    const handleHover = useCallback(
      (tarea: ITarea | null, x: number, y: number) => {
        setTooltip(tarea ? { tarea, x, y } : null);
      },
      [],
    );

    const zoomLevel = useMemo(
      () => getZoomLevelFromPixels(pixelsPerDay),
      [pixelsPerDay],
    );

    const itemData = useMemo<ItemData>(
      () => ({
        rows,
        panOffset,
        pixelsPerDay,
        timelineStart,
        totalWidth,
        selectedTareaId,
        onHover: handleHover,
        onRightClick: onSelectTarea,
        onDoubleClick: onOpenEdit,
      }),
      [rows, panOffset, pixelsPerDay, timelineStart, totalWidth, selectedTareaId, handleHover, onSelectTarea, onOpenEdit],
    );

    const listHeight = height - HEADER_HEIGHT;

    return (
      <div
        ref={containerRef}
        className="flex flex-col h-full overflow-hidden select-none"
        onMouseDown={onMouseDown}
        onContextMenu={onContextMenu}
        style={{ cursor: 'default', width }}
      >
        <TimeHeader
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          pixelsPerDay={pixelsPerDay}
          panOffset={panOffset}
          zoomLevel={zoomLevel}
          totalWidth={totalWidth}
        />

        <div className="relative flex-1 overflow-hidden">
          {/* Today line spans full height */}
          <TodayLine
            timelineStart={timelineStart}
            pixelsPerDay={pixelsPerDay}
            panOffset={panOffset}
            totalHeight={listHeight}
          />

          <FixedSizeList<ItemData>
            ref={listRef}
            height={listHeight}
            width={width}
            itemCount={rows.length}
            itemSize={ROW_HEIGHT}
            itemData={itemData}
            onScroll={onScroll}
            overscanCount={5}
          >
            {RowRenderer}
          </FixedSizeList>
        </div>

        {tooltip && <CustomTooltip tooltip={tooltip} containerRect={containerRect} />}
      </div>
    );
  },
);
