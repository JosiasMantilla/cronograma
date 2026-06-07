import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { SearchAndFilter } from './components/Toolbar/SearchAndFilter';
import { TreePanel } from './components/TreePanel/TreePanel';
import { GanttChart } from './components/GanttChart/GanttChart';
import { ConstraintsTable } from './components/ConstraintsTable/ConstraintsTable';
import { EditTareaModal } from './components/Modals/EditTareaModal';
import { AddTareaModal } from './components/Modals/AddTareaModal';
import { MemberAvatarModal } from './components/Modals/MemberAvatarModal';
import { ExportReportModal } from './components/Modals/ExportReportModal';
import { useGanttData } from './hooks/useGanttData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useZoomAndPan } from './hooks/useZoomAndPan';
import { useVirtualRows } from './hooks/useVirtualRows';
import { clamp } from './utils/ganttHelpers';
import { exportToExcel, exportReportToExcel } from './utils/excelExport';
import { BOTTOM_PANEL_HEIGHT, LEFT_PANEL_WIDTH, TOOLBAR_HEIGHT } from './utils/constants';
import type { IExportRow } from './types';
import './styles/globals.css';

const FILTER_BAR_HEIGHT = 52;

export default function App() {
  const {
    frentes,
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
    filterState,
    setFilterState,
    clearFilters,
    hasActiveFilters,
    timelineStart,
    timelineEnd,
    totalTimelineWidth,
    toggleExpanded,
    selectTarea,
    openEdit,
    closeEdit,
    updateTarea,
    updateMembers,
    addTarea,
    setHideSectors,
    setHideTasks,
    setCronogramaGeneral,
    setCronogramaEspecifico,
  } = useGanttData();

  // Persisted toolbar preferences
  const [projectName, setProjectName] = useLocalStorage<string>('gantt_project_name', 'Cronograma Gantt');
  const [cutDay, setCutDay] = useLocalStorage<number>('gantt_cut_day', 0);

  // UI state (not persisted)
  const [isExporting, setIsExporting] = useState(false);
  const [filterBarOpen, setFilterBarOpen] = useState(false);
  const [exportReportOpen, setExportReportOpen] = useState(false);
  const [addTareaTarget, setAddTareaTarget] = useState<{ frenteId: string; sectorId: string } | null>(null);
  const [avatarManageTareaId, setAvatarManageTareaId] = useState<string | null>(null);

  // Derived data
  const cutDate = useMemo<Date | undefined>(() => {
    if (cutDay <= 0) return undefined;
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return new Date(now.getFullYear(), now.getMonth(), Math.min(cutDay, lastDay));
  }, [cutDay]);

  const addTareaSectorNombre = useMemo(() => {
    if (!addTareaTarget) return '';
    for (const f of frentes) {
      if (f.id !== addTareaTarget.frenteId) continue;
      for (const s of f.sectores) {
        if (s.id === addTareaTarget.sectorId) return s.nombre;
      }
    }
    return '';
  }, [frentes, addTareaTarget]);

  const selectedTareaPath = useMemo<string | null>(() => {
    if (!selectedTareaId) return null;
    for (const f of frentes) {
      for (const s of f.sectores) {
        const t = s.tareas.find((x) => x.id === selectedTareaId);
        if (t) return `${f.nombre} / ${s.nombre} / ${t.nombre}`;
      }
    }
    return null;
  }, [frentes, selectedTareaId]);

  const avatarManageTarea = useMemo(() => {
    if (!avatarManageTareaId) return null;
    for (const f of frentes) {
      for (const s of f.sectores) {
        const t = s.tareas.find((x) => x.id === avatarManageTareaId);
        if (t) return t;
      }
    }
    return null;
  }, [frentes, avatarManageTareaId]);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Gantt dimensions (accounts for filter bar)
  const [ganttDims, setGanttDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth - LEFT_PANEL_WIDTH;
      const h =
        window.innerHeight -
        TOOLBAR_HEIGHT -
        (filterBarOpen ? FILTER_BAR_HEIGHT : 0) -
        BOTTOM_PANEL_HEIGHT;
      setGanttDims({ width: Math.max(w, 200), height: Math.max(h, 200) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [filterBarOpen]);

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

  // Export handlers
  const handleExport = useCallback(() => {
    if (isExporting) return;
    setIsExporting(true);
    setTimeout(() => {
      try {
        exportToExcel(frentes);
      } finally {
        setIsExporting(false);
      }
    }, 50);
  }, [frentes, isExporting]);

  const handleExportReport = useCallback((rows: IExportRow[], filename: string) => {
    exportReportToExcel(rows, filename);
  }, []);


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Toolbar
        hideSectors={hideSectors}
        hideTasks={hideTasks}
        isDarkMode={isDarkMode}
        pixelsPerDay={pixelsPerDay}
        canPanLeft={canPanLeft}
        canPanRight={canPanRight}
        isExporting={isExporting}
        projectName={projectName}
        cutDay={cutDay}
        filterBarOpen={filterBarOpen}
        hasActiveFilters={hasActiveFilters}
        onToggleSectors={() => setHideSectors((v) => !v)}
        onToggleTasks={() => setHideTasks((v) => !v)}
        onToggleDark={() => setIsDarkMode((v) => !v)}
        onCronogramaGeneral={setCronogramaGeneral}
        onCronogramaEspecifico={setCronogramaEspecifico}
        onPanLeft={panLeft}
        onPanRight={panRight}
        onGoToToday={goToToday}
        onZoomChange={setPixelsPerDay}
        onExport={handleExport}
        onProjectNameChange={setProjectName}
        onCutDayChange={setCutDay}
        onToggleFilterBar={() => setFilterBarOpen((v) => !v)}
        onOpenExportReport={() => setExportReportOpen(true)}
      />

      {filterBarOpen && (
        <SearchAndFilter
          filters={filterState}
          frentes={frentes}
          onChange={setFilterState}
          onClear={clearFilters}
        />
      )}

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
          cutDate={cutDate}
        />
      </div>

      <ConstraintsTable selectedTarea={selectedTarea} selectedTareaPath={selectedTareaPath} />

      {editingTarea && (
        <EditTareaModal tarea={editingTarea} onSave={updateTarea} onClose={closeEdit} />
      )}

      {addTareaTarget && (
        <AddTareaModal
          frenteId={addTareaTarget.frenteId}
          sectorId={addTareaTarget.sectorId}
          sectorNombre={addTareaSectorNombre}
          onSave={addTarea}
          onClose={() => setAddTareaTarget(null)}
        />
      )}

      {avatarManageTarea && (
        <MemberAvatarModal
          tarea={avatarManageTarea}
          onSave={updateMembers}
          onClose={() => setAvatarManageTareaId(null)}
        />
      )}

      {exportReportOpen && (
        <ExportReportModal
          frentes={frentes}
          filters={filterState}
          onExport={handleExportReport}
          onClose={() => setExportReportOpen(false)}
        />
      )}
    </div>
  );
}
