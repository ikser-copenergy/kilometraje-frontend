import { useEffect, useState, useCallback } from 'react';
import type { Kilometraje } from '../types/Kilometraje';
import { getAll } from '../services/KilometrajeService';
import { Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { EditKilometrajeModal } from './EditKilometrajeModal';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import dayjs from 'dayjs';
import { exportToExcel } from '../services/PdfService';

const MIN_LOADING_DURATION = 1000; // ms

export const KilometrajeTable = () => {
  const [data, setData] = useState<Kilometraje[]>([]);
  const [editing, setEditing] = useState<Kilometraje | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const fetchData = useCallback(
    async (inicio: string, fin: string) => {
      if (dayjs(fin).isBefore(dayjs(inicio))) return;
      setLoading(true);
      setError(null);
      const start = Date.now();
      try {
        const res = await getAll(inicio, fin);
        if (res.data.success && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          throw new Error('Estructura de respuesta inesperada');
        }
      } catch {
        setError('No se pudieron cargar los datos');
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, MIN_LOADING_DURATION - elapsed);
        setTimeout(() => setLoading(false), delay);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(fechaInicio, fechaFin);
  }, [fetchData, fechaInicio, fechaFin]);

  const handleDownload = () => {
    if (
      fechaInicio &&
      fechaFin &&
      !dayjs(fechaFin).isBefore(dayjs(fechaInicio))
    ) {
      exportToExcel(fechaInicio, fechaFin);
    }
  };

  return (
    <Paper sx={{ padding: 2, position: 'relative' }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      <Typography variant="h6" gutterBottom>
        Lista de Registros
      </Typography>

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
        {!isXs ? (
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
        ) : (
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
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.kilometraje_inicio}</TableCell>
                <TableCell>{row.kilometraje_fin}</TableCell>
                <TableCell>{row.kilometraje_fin - row.kilometraje_inicio}</TableCell>
                <TableCell>{new Date(row.fecha).toLocaleString()}</TableCell>
                <TableCell>{row.nombre_conductor}</TableCell>
                <TableCell>{row.vehiculo}</TableCell>
                <TableCell>{row.motivo_uso}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditing(row)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {editing && (
        <EditKilometrajeModal
          open={!!editing}
          initialData={editing}
          onClose={() => setEditing(null)}
          onUpdated={() => {
            fetchData(fechaInicio, fechaFin);
            setEditing(null);
          }}
        />
      )}
    </Paper>
  );
};
