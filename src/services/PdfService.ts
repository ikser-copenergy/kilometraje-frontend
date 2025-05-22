// src/services/ExcelService.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Kilometraje } from '../types/Kilometraje';
import { getAll } from './KilometrajeService';

export const exportToExcel = async (fechaInicio: string, fechaFin: string) => {
  try {
    const res = await getAll(fechaInicio, fechaFin);
    const data: Kilometraje[] = res.data.data;

    // Si no hay datos, no generar ni descargar Excel
    if (!data || data.length === 0) {
      console.info('No hay registros de kilometraje entre las fechas proporcionadas.');
      return;
    }

    // Crear nuevo workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kilometraje');

    // Ajustar altura de filas 1, 2 y 3 al doble
    [1, 2, 3].forEach((i) => {
      worksheet.getRow(i).height = 30;
    });

    // Cargar logo desde carpeta public
    const logoResponse = await fetch('/arrayan-logo.jpg');
    const logoBuffer = await logoResponse.arrayBuffer();
    const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'jpeg' });

    // 1. Título "CONTROL DE KILOMETRAJES" fusionado A1:H3
    worksheet.mergeCells('A1:H3');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'CORPORACIÓN ARRAYAN S. DE R.L.\nCONTROL DE KILOMETRAJES';
    titleCell.value = 'CORPORACIÓN ARRAYAN S. DE R.L.\nCONTROL DE KILOMETRAJES';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    titleCell.font = { bold: true, size: 13 };

    // Insertar imagen cuadrada 70x70 en área A1:H3, extremo derecho
    worksheet.addImage(imageId, {
      tl: { col: 7.2, row: 0.5 },
      ext: { width: 100, height: 100 }
    });

    // 2. Fila 4 en blanco
    worksheet.addRow([]);

    // 3. "DATOS GENERALES" fusionado A5:H5
    worksheet.mergeCells('A5:H5');
    const datosCell = worksheet.getCell('A5');
    datosCell.value = 'Datos Generales';
    datosCell.alignment = { horizontal: 'left', vertical: 'middle' };
    datosCell.font = { bold: true, size: 12 };

    // 4. Fila 6 en blanco
    worksheet.addRow([]);

    // 5. Encabezados de tabla en fila 7
    const headers = [
      'Fecha',
      'Kilometraje Inicial',
      'Kilometraje Final',
      'Hora',
      'KM',
      'Conductor',
      'Vehículo',
      'Motivo de Uso',
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // 6. Datos a partir de la fila 8
    data.forEach(rowData => {
      const fecha = new Date(rowData.fecha);
      const day = String(fecha.getDate()).padStart(2, '0');
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const year = fecha.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      const seconds = String(fecha.getSeconds()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      const row = worksheet.addRow([
        formattedDate,
        rowData.kilometraje_inicio,
        rowData.kilometraje_fin,
        formattedTime,
        rowData.kilometraje_fin - rowData.kilometraje_inicio,
        rowData.nombre_conductor,
        rowData.vehiculo,
        rowData.motivo_uso,
      ]);
      // Alinear celdas
      row.eachCell((cell, colNumber) => {
        cell.alignment = colNumber === 8
          ? { horizontal: 'left', vertical: 'middle' }
          : { horizontal: 'center', vertical: 'middle' };
      });
    });

    // 7. Ajuste automático de ancho de columnas al contenido de tabla
    const endCol = headers.length;
    for (let col = 1; col <= endCol; col++) {
      const column = worksheet.getColumn(col);
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const val = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, val.length);
      });
      column.width = maxLength + 2;
    }

    // 8. Ajuste manual de ancho personalizado
    const customWidths: { [key: number]: number } = {
      1: 20,
      2: 20,
      3: 20,
      4: 20,
      5: 20,
      6: 30,
      7: 30,
      8: 60,
    };
    Object.entries(customWidths).forEach(([col, width]) => {
      worksheet.getColumn(Number(col)).width = width;
    });

    // 9. Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `kilometraje_${fechaInicio}_a_${fechaFin}.xlsx`);
  } catch (error) {
    console.error('Error al generar Excel con ExcelJS:', error);
  }
};
