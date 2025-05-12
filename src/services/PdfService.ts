// src/services/PdfService.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Kilometraje } from '../types/Kilometraje';
import { getAll } from './KilometrajeService';

export const exportToExcel = async (fechaInicio: string, fechaFin: string) => {
  try {
    const res = await getAll(fechaInicio, fechaFin);
    const data: Kilometraje[] = res.data.data;

    const rows = data.map(row => ({
      'Fecha': new Date(row.fecha).toLocaleDateString(),
      'Kilometraje Inicial': row.kilometraje_inicio,
      'Kilometraje Final': row.kilometraje_fin,
      'Hora': new Date(row.fecha).toLocaleTimeString(),
      'KM': row.kilometraje_fin - row.kilometraje_inicio,
      'Conductor': row.nombre_conductor,
      'Vehículo': row.vehiculo,
      'Motivo de Uso': row.motivo_uso,
    }));

    const worksheet = XLSX.utils.json_to_sheet([]);
    const headers = Object.keys(rows[0]);
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    XLSX.utils.sheet_add_json(worksheet, rows, { skipHeader: true, origin: 'A2' });

    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ c: index, r: 0 });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    });

    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const header = headers[C];
        worksheet[cellRef] = worksheet[cellRef] || {};
        worksheet[cellRef].s = {
          alignment: {
            horizontal: header === 'Motivo de Uso' ? 'left' : 'center'
          }
        };
      }
    }

    worksheet['!cols'] = headers.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kilometraje');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `kilometraje_${fechaInicio}_a_${fechaFin}.xlsx`);
  } catch (error) {
    console.error('Error al generar Excel:', error);
  }
};
