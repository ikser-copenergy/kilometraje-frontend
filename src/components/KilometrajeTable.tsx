import React, { useEffect, useState } from 'react';
import type { Kilometraje } from '../types/Kilometraje';
import { getAll } from '../services/KilometrajeService';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import dayjs from 'dayjs';
import { exportToExcel } from '../services/PdfService';

export const KilometrajeTable = () => {
  const [data, setData] = useState<Kilometraje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));

  const theme = useTheme();
  // detecta tamaño xs (<=600px)
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const fetchData = (inicio: string, fin: string) => {
    if (dayjs(fin).isBefore(dayjs(inicio))) return;
    setLoading(true);
    setError(null);
    getAll(inicio, fin)
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          throw new Error('Estructura de respuesta inesperada');
        }
      })
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  };

  const handleDownload = () => {
    if (
      fechaInicio &&
      fechaFin &&
      !dayjs(fechaFin).isBefore(dayjs(fechaInicio))
    ) {
      exportToExcel(fechaInicio, fechaFin);
    }
  };

  useEffect(() => {
    fetchData(fechaInicio, fechaFin);
  }, []);

  useEffect(() => {
    if (
      fechaInicio &&
      fechaFin &&
      !dayjs(fechaFin).isBefore(dayjs(fechaInicio))
    ) {
      fetchData(fechaInicio, fechaFin);
    }
  }, [fechaInicio, fechaFin]);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lista de Registros
      </Typography>

      {/* Stack siempre en row para mantener TextFields lado a lado */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          size="small"
          margin="dense"
          label="Fecha Inicio"
          type="date"
          value={fechaInicio}
          onChange={e => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          margin="dense"
          label="Fecha Fin"
          type="date"
          value={fechaFin}
          onChange={e => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {/* Botón en línea sólo en pantallas > xs */}
        {!isXs && (
          <Button
            variant="outlined"
            color="success"
            size="medium"           // tamaño medio para igualar altura
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            sx={{ height: '40px' }}  // altura fija
          >
            Descargar Excel
          </Button>
        )}
      </Stack>

      {/* Botón separado sólo en xs */}
      {isXs && (
        <Stack mb={2} alignItems="flex-start">
          <Button
            variant="outlined"
            color="success"
            size="medium"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            sx={{ height: '40px' }}
          >
            Descargar Excel
          </Button>
        </Stack>
      )}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Recorrido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Conductor</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.kilometraje_inicio}</TableCell>
                  <TableCell>{row.kilometraje_fin}</TableCell>
                  <TableCell>
                    {row.kilometraje_fin - row.kilometraje_inicio}
                  </TableCell>
                  <TableCell>
                    {new Date(row.fecha).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.nombre_conductor}</TableCell>
                  <TableCell>{row.vehiculo}</TableCell>
                  <TableCell>{row.motivo_uso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
