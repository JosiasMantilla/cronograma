export type TipoRestriccion = 'predecesora' | 'recurso' | 'fecha limite';

export interface IRestriccion {
  id: string;
  tipo: TipoRestriccion;
  descripcion: string;
  valor?: string;
}

export interface ITarea {
  id: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracionDias: number;
  porcentajeAvance: number;
  integrantes: string[];
  restricciones: IRestriccion[];
}

export interface ISector {
  id: string;
  nombre: string;
  tareas: ITarea[];
}

export interface IFrente {
  id: string;
  nombre: string;
  sectores: ISector[];
}

export type ZoomLevel = 'anual' | 'semestral' | 'trimestral' | 'mensual' | 'semanal' | 'diaria';

export interface IFrenteRow {
  type: 'frente';
  id: string;
  depth: 0;
  frente: IFrente;
  isExpanded: boolean;
}

export interface ISectorRow {
  type: 'sector';
  id: string;
  depth: 1;
  frente: IFrente;
  sector: ISector;
  isExpanded: boolean;
}

export interface ITareaRow {
  type: 'tarea';
  id: string;
  depth: 1 | 2;
  frente: IFrente;
  sector: ISector;
  tarea: ITarea;
}

export type IRow = IFrenteRow | ISectorRow | ITareaRow;

export interface ITooltipState {
  tarea: ITarea;
  x: number;
  y: number;
}

export interface ITimeHeaderUnit {
  label: string;
  startPx: number;
  widthPx: number;
}

export interface IEditTareaPayload {
  fechaInicio: Date;
  fechaFin: Date;
  porcentajeAvance: number;
}
