import { memo, useMemo, useCallback, useEffect, type CSSProperties } from 'react';
import { VariableSizeList, type ListChildComponentProps } from 'react-window';
import { TreeNode } from './TreeNode';
import { ROW_HEIGHT, TAREA_ROW_HEIGHT, LEFT_PANEL_WIDTH, HEADER_HEIGHT,SECTOR_ROW_HEIGHT } from '../../utils/constants';
import type { IRow } from '../../types';
import type { VariableSizeList as VariableSizeListType } from 'react-window';

interface ItemData {
  rows: IRow[];
  selectedTareaId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}

const RowRenderer = memo(({ index, style, data }: ListChildComponentProps<ItemData>) => {
  const row = data.rows[index];
  return (
    <TreeNode
      row={row}
      style={style as CSSProperties}
      isSelected={row.type === 'tarea' && data.selectedTareaId === row.id}
      onToggle={data.onToggle}
      onSelect={data.onSelect}
    />
  );
});

interface TreePanelProps {
  listRef: React.RefObject<VariableSizeListType | null>;
  rows: IRow[];
  selectedTareaId: string | null;
  onScroll: (args: { scrollOffset: number }) => void;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  height: number;
}

const HEADER_COLS = [
  { label: 'Tarea / Integrante', flex: true },
  { label: 'Inicio', width: 64 },
  { label: 'Fin', width: 64 },
  { label: 'Dur', width: 32 },
  { label: 'Avance', width: 56 },
];

export const TreePanel = memo(
  ({
    listRef,
    rows,
    selectedTareaId,
    onScroll,
    onToggle,
    onSelect,
    height,
  }: TreePanelProps) => {
    const getItemSize = useCallback(
      (index: number) => {
        const row = rows[index];

        if (row?.type === 'tarea')
          return TAREA_ROW_HEIGHT;

        if (row?.type === 'sector')
        return SECTOR_ROW_HEIGHT;

      return ROW_HEIGHT;
      },
      [rows],
    );

    // Reset size cache whenever rows change (type/order may have changed)
    useEffect(() => {
      listRef.current?.resetAfterIndex(0, true);
    }, [rows, listRef]);

    const itemData = useMemo<ItemData>(
      () => ({ rows, selectedTareaId, onToggle, onSelect }),
      [rows, selectedTareaId, onToggle, onSelect],
    );

    const listHeight = height - HEADER_HEIGHT;

    return (
      <div
        className="flex flex-col shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ width: LEFT_PANEL_WIDTH }}
        role="tree"
        aria-label="Jerarquía de frentes y sectores"
      >
        <div
          className="flex items-end pb-1 px-2 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0"
          style={{ height: HEADER_HEIGHT }}
        >
          {HEADER_COLS.map((col) => (
            <div
              key={col.label}
              className={`${col.flex ? 'flex-1 min-w-0' : 'shrink-0 text-center'} truncate`}
              style={col.width ? { width: col.width } : undefined}
            >
              {col.label}
            </div>
          ))}
        </div>

        <VariableSizeList<ItemData>
          ref={listRef}
          height={listHeight}
          width={LEFT_PANEL_WIDTH}
          itemCount={rows.length}
          itemSize={getItemSize}
          estimatedItemSize={ROW_HEIGHT}
          itemData={itemData}
          onScroll={onScroll}
          overscanCount={15}
        >
          {RowRenderer}
        </VariableSizeList>
      </div>
    );
  },
);
