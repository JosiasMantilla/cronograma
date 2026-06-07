import { useCallback, useEffect, useRef, useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { TreePanel } from './components/TreePanel/TreePanel';
import { GanttChart } from './components/GanttChart/GanttChart';
import { ConstraintsTable } from './components/ConstraintsTable/ConstraintsTable';
import { EditTareaModal } from './components/Modals/EditTareaModal';
import { useGanttData } from './hooks/useGanttData';
import { useZoomAndPan } from './hooks/useZoomAndPan';
import { useVirtualRows } from './hooks/useVirtualRows';
import { clamp } from './utils/ganttHelpers';
import { BOTTOM_PANEL_HEIGHT, LEFT_PANEL_WIDTH, TOOLBAR_HEIGHT } from './utils/constants';
import './styles/globals.css';

export default function App() {
  const {
    visibleRows,
    selectedTareaId,
    selectedTarea,
    editingTarea,
    pixelsPerDay,
    setPixelsPerDay,
    panOffset,
    setPanOffset,
    hideSectors,
    hideTasks,
    isDarkMode,
    setIsDarkMode,
    timelineStart,
    timelineEnd,
    totalTimelineWidth,
    toggleExpanded,
    selectTarea,
    openEdit,
    closeEdit,
    updateTarea,
    setHideSectors,
    setHideTasks,
    setCronogramaGeneral,
    setCronogramaEspecifico,
  } = useGanttData();

  // Apply dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const [ganttDims, setGanttDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth - LEFT_PANEL_WIDTH;
      const h = window.innerHeight - TOOLBAR_HEIGHT - BOTTOM_PANEL_HEIGHT;
      setGanttDims({ width: Math.max(w, 200), height: Math.max(h, 200) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const mainHeight = ganttDims.height;
  const maxPanOffset = Math.max(0, totalTimelineWidth - ganttDims.width);

  const { leftListRef, rightListRef, onLeftScroll, onRightScroll } = useVirtualRows();

  const { handleWheel, handleMouseDown, panLeft, panRight, goToToday, canPanLeft, canPanRight } =
    useZoomAndPan({
      pixelsPerDay,
      setPixelsPerDay,
      panOffset,
      setPanOffset,
      totalTimelineWidth,
      ganttViewWidth: ganttDims.width,
      timelineStart,
    });

  const wheelCleanupRef = useRef<(() => void) | null>(null);

  const onWheelSetup = useCallback(
    (el: HTMLElement) => {
      if (wheelCleanupRef.current) wheelCleanupRef.current();
      const handler = (e: WheelEvent) => handleWheel(e);
      el.addEventListener('wheel', handler, { passive: false });
      wheelCleanupRef.current = () => el.removeEventListener('wheel', handler);
    },
    [handleWheel],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Clamp pan when limits shrink
  useEffect(() => {
    if (panOffset > maxPanOffset) setPanOffset(clamp(panOffset, 0, maxPanOffset));
  }, [maxPanOffset, panOffset, setPanOffset]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Toolbar
        hideSectors={hideSectors}
        hideTasks={hideTasks}
        isDarkMode={isDarkMode}
        pixelsPerDay={pixelsPerDay}
        canPanLeft={canPanLeft}
        canPanRight={canPanRight}
        onToggleSectors={() => setHideSectors((v) => !v)}
        onToggleTasks={() => setHideTasks((v) => !v)}
        onToggleDark={() => setIsDarkMode((v) => !v)}
        onCronogramaGeneral={setCronogramaGeneral}
        onCronogramaEspecifico={setCronogramaEspecifico}
        onPanLeft={panLeft}
        onPanRight={panRight}
        onGoToToday={goToToday}
        onZoomChange={setPixelsPerDay}
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: mainHeight }}>
        <TreePanel
          listRef={leftListRef}
          rows={visibleRows}
          selectedTareaId={selectedTareaId}
          onScroll={onLeftScroll}
          onToggle={toggleExpanded}
          onSelect={selectTarea}
          height={mainHeight}
        />

        <GanttChart
          listRef={rightListRef}
          rows={visibleRows}
          panOffset={panOffset}
          pixelsPerDay={pixelsPerDay}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          totalWidth={totalTimelineWidth}
          selectedTareaId={selectedTareaId}
          onScroll={onRightScroll}
          onWheelSetup={onWheelSetup}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
          onSelectTarea={selectTarea}
          onOpenEdit={openEdit}
          height={mainHeight}
          width={ganttDims.width}
        />
      </div>

      <ConstraintsTable selectedTarea={selectedTarea} />

      {editingTarea && (
        <EditTareaModal tarea={editingTarea} onSave={updateTarea} onClose={closeEdit} />
      )}
    </div>
  );
}
