export interface Kilometraje {
    id: number;
    kilometraje_inicio: number;
    kilometraje_fin: number;
    fecha: string;
    nombre_conductor: string;
    vehiculo?: string;
    motivo_uso: string;
    id_vehiculo: number;
  }