import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IFrente, IExportRow } from '../types';

const ESTADO_LABELS: Record<string, string> = {
  completada: 'Completada',
  en_progreso: 'En progreso',
  no_iniciada: 'No iniciada',
  atrasada: 'Atrasada',
};

// ---------- Style constants ----------

type XlsxRgb = { rgb: string };
type XlsxFill = { patternType: 'solid'; fgColor: XlsxRgb };
type XlsxFont = { bold?: boolean; color?: XlsxRgb; sz?: number; name?: string };
type XlsxAlignment = { horizontal?: string; vertical?: string; wrapText?: boolean };
type XlsxBorderSide = { style: 'thin' | 'medium'; color: XlsxRgb };
type XlsxBorders = {
  top?: XlsxBorderSide;
  bottom?: XlsxBorderSide;
  left?: XlsxBorderSide;
  right?: XlsxBorderSide;
};
interface XlsxCellStyle {
  fill?: XlsxFill;
  font?: XlsxFont;
  alignment?: XlsxAlignment;
  border?: XlsxBorders;
}

const BORDER_SIDE: XlsxBorderSide = { style: 'thin', color: { rgb: 'D1D5DB' } };
const ALL_BORDERS: XlsxBorders = {
  top: BORDER_SIDE,
  bottom: BORDER_SIDE,
  left: BORDER_SIDE,
  right: BORDER_SIDE,
};

const HEADER_STYLE: XlsxCellStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: '1E3A8A' } },
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'medium', color: { rgb: '1E3A8A' } },
    bottom: { style: 'medium', color: { rgb: '1E3A8A' } },
    left: { style: 'thin', color: { rgb: '2563EB' } },
    right: { style: 'thin', color: { rgb: '2563EB' } },
  },
};

const ROW_EVEN: XlsxCellStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'EFF6FF' } },
  font: { sz: 10, name: 'Calibri' },
  alignment: { vertical: 'center' },
  border: ALL_BORDERS,
};

const ROW_ODD: XlsxCellStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
  font: { sz: 10, name: 'Calibri' },
  alignment: { vertical: 'center' },
  border: ALL_BORDERS,
};

const FRENTE_STYLE: XlsxCellStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'DBEAFE' } },
  font: { bold: true, sz: 10, color: { rgb: '1E40AF' }, name: 'Calibri' },
  alignment: { vertical: 'center' },
  border: ALL_BORDERS,
};

const SECTOR_STYLE: XlsxCellStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'F0F9FF' } },
  font: { bold: true, sz: 10, color: { rgb: '0369A1' }, name: 'Calibri' },
  alignment: { vertical: 'center' },
  border: ALL_BORDERS,
};


// ---------- Helpers ----------

function fmtDate(d: Date): string {
  return format(d, 'dd/MM/yyyy', { locale: es });
}

function percentStyle(pct: number, even: boolean): XlsxCellStyle {
  const base = even ? ROW_EVEN : ROW_ODD;
  if (pct >= 100) return { ...base, font: { ...base.font, bold: true, color: { rgb: '15803D' } } };
  if (pct >= 50) return { ...base, font: { ...base.font, bold: true, color: { rgb: '92400E' } } };
  return { ...base, font: { ...base.font, bold: true, color: { rgb: '991B1B' } } };
}

// ---------- Main export ----------

export function exportToExcel(frentes: IFrente[]): void {
  const HEADERS = [
    'Frente',
    'Sector',
    'Tarea',
    'Integrantes',
    'Fecha Inicio',
    'Fecha Fin',
    'Duración (días)',
    '% Avance',
  ];

  // Build rows: [cellValue, …]
  type DataRow = {
    values: (string | number)[];
    frenteSpan: boolean;
    sectorSpan: boolean;
    rowIndex: number; // 0-based data index (used for alternating colors)
    avance: number;
  };

  const rows: DataRow[] = [];
  let dataIndex = 0;

  for (const frente of frentes) {
    let frenteFirst = true;
    for (const sector of frente.sectores) {
      let sectorFirst = true;
      for (const tarea of sector.tareas) {
        rows.push({
          values: [
            frenteFirst ? frente.nombre : '',
            sectorFirst ? sector.nombre : '',
            tarea.nombre,
            tarea.integrantes.length > 0 ? tarea.integrantes.join(', ') : 'Sin asignar',
            fmtDate(tarea.fechaInicio),
            fmtDate(tarea.fechaFin),
            tarea.duracionDias,
            tarea.porcentajeAvance,
          ],
          frenteSpan: frenteFirst,
          sectorSpan: sectorFirst,
          rowIndex: dataIndex++,
          avance: tarea.porcentajeAvance,
        });
        frenteFirst = false;
        sectorFirst = false;
      }
    }
  }

  // Build AOA (array of arrays) for the worksheet
  const aoa: (string | number)[][] = [HEADERS, ...rows.map((r) => r.values)];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ---------- Apply cell styles ----------
  const colCount = HEADERS.length;
  const totalRows = aoa.length; // header + data rows

  // Header row (row 0 in AOA = Excel row 1)
  for (let c = 0; c < colCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: HEADERS[c] };
    (ws[ref] as XLSX.CellObject & { s: XlsxCellStyle }).s = HEADER_STYLE;
  }

  // Data rows
  for (let ri = 0; ri < rows.length; ri++) {
    const excelRow = ri + 1; // +1 for header
    const row = rows[ri];
    const even = row.rowIndex % 2 === 0;
    const baseStyle = even ? ROW_EVEN : ROW_ODD;

    for (let c = 0; c < colCount; c++) {
      const ref = XLSX.utils.encode_cell({ r: excelRow, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };

      let style: XlsxCellStyle = baseStyle;

      // Column 0 = Frente
      if (c === 0 && row.frenteSpan) style = FRENTE_STYLE;
      // Column 1 = Sector
      else if (c === 1 && row.sectorSpan) style = SECTOR_STYLE;
      // Column 7 = % Avance
      else if (c === 7) style = percentStyle(row.avance, even);

      // Center-align dates and numbers
      if (c >= 4) {
        style = { ...style, alignment: { ...style.alignment, horizontal: 'center' } };
      }

      (ws[ref] as XLSX.CellObject & { s: XlsxCellStyle }).s = style;
    }
  }

  // ---------- Column widths ----------
  ws['!cols'] = [
    { wch: 28 }, // Frente
    { wch: 26 }, // Sector
    { wch: 38 }, // Tarea
    { wch: 36 }, // Integrantes
    { wch: 14 }, // Fecha Inicio
    { wch: 14 }, // Fecha Fin
    { wch: 14 }, // Duración
    { wch: 10 }, // % Avance
  ];

  // ---------- Row heights ----------
  ws['!rows'] = Array.from({ length: totalRows }, (_, i) => ({
    hpt: i === 0 ? 28 : 20, // header taller
  }));

  // ---------- Freeze panes (header + left two cols) ----------
  ws['!freeze'] = { xSplit: 2, ySplit: 1 };

  // ---------- Workbook ----------
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

  // Summary sheet
  const summaryData: (string | number)[][] = [
    ['Resumen del Cronograma'],
    [],
    ['Frente', 'Sectores', 'Tareas', 'Avance Promedio'],
    ...frentes.map((f) => {
      const tareas = f.sectores.flatMap((s) => s.tareas);
      const avgAvance =
        tareas.length > 0
          ? Math.round(tareas.reduce((sum, t) => sum + t.porcentajeAvance, 0) / tareas.length)
          : 0;
      return [f.nombre, f.sectores.length, tareas.length, avgAvance];
    }),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 18 }];

  // Style summary header row (row index 2 = "Frente | Sectores | ...")
  const summaryHeaderRow = 2;
  for (let c = 0; c < 4; c++) {
    const ref = XLSX.utils.encode_cell({ r: summaryHeaderRow, c });
    if (wsSummary[ref]) {
      (wsSummary[ref] as XLSX.CellObject & { s: XlsxCellStyle }).s = HEADER_STYLE;
    }
  }
  // Style title
  const titleRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (wsSummary[titleRef]) {
    (wsSummary[titleRef] as XLSX.CellObject & { s: XlsxCellStyle }).s = {
      font: { bold: true, sz: 14, color: { rgb: '1E3A8A' }, name: 'Calibri' },
    };
  }

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  // ---------- Export ----------
  const fileName = `cronograma_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  XLSX.writeFile(wb, fileName, { bookType: 'xlsx', cellStyles: true });
}

// ---------- Report export (filtered rows with Estado column) ----------

export function exportReportToExcel(rows: IExportRow[], filename: string): void {
  if (rows.length === 0) return;

  const HEADERS = [
    'Frente', 'Sector', 'Tarea', 'Integrantes',
    'Fecha Inicio', 'Fecha Fin', 'Duración (días)', '% Avance', 'Estado',
  ];

  const aoa: (string | number)[][] = [
    HEADERS,
    ...rows.map((r) => [
      r.frenteNombre,
      r.sectorNombre,
      r.tarea.nombre,
      r.tarea.integrantes.length > 0 ? r.tarea.integrantes.join(', ') : 'Sin asignar',
      fmtDate(r.tarea.fechaInicio),
      fmtDate(r.tarea.fechaFin),
      r.tarea.duracionDias,
      r.tarea.porcentajeAvance,
      ESTADO_LABELS[r.estado] ?? r.estado,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const colCount = HEADERS.length;

  for (let c = 0; c < colCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[ref]) ws[ref] = { t: 's', v: HEADERS[c] };
    (ws[ref] as XLSX.CellObject & { s: XlsxCellStyle }).s = HEADER_STYLE;
  }

  for (let ri = 0; ri < rows.length; ri++) {
    const excelRow = ri + 1;
    const row = rows[ri];
    const even = ri % 2 === 0;
    const baseStyle = even ? ROW_EVEN : ROW_ODD;

    for (let c = 0; c < colCount; c++) {
      const ref = XLSX.utils.encode_cell({ r: excelRow, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };

      let style: XlsxCellStyle = baseStyle;
      if (c === 7) style = percentStyle(row.tarea.porcentajeAvance, even);
      if (c >= 4 && c <= 7) {
        style = { ...style, alignment: { ...style.alignment, horizontal: 'center' } };
      }

      (ws[ref] as XLSX.CellObject & { s: XlsxCellStyle }).s = style;
    }
  }

  ws['!cols'] = [
    { wch: 28 }, { wch: 24 }, { wch: 36 }, { wch: 28 },
    { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 14 },
  ];
  ws['!rows'] = Array.from({ length: aoa.length }, (_, i) => ({ hpt: i === 0 ? 28 : 20 }));
  ws['!freeze'] = { xSplit: 2, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, filename, { bookType: 'xlsx', cellStyles: true });
}
