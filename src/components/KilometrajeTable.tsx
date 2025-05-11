// src/components/KilometrajeTable.tsx
import { useEffect, useState } from 'react';
import type { Kilometraje } from '../types/Kilometraje';
import { getAll } from '../services/KilometrajeService';
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
} from '@mui/material';

export const KilometrajeTable = () => {
  const [data, setData] = useState<Kilometraje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAll()
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setData(res.data.data);
        } else {
          throw new Error('Estructura de respuesta inesperada');
        }
      })
      .catch(() => {
        setError('No se pudieron cargar los datos');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>Lista de Registros</Typography>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Conductor</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Motivo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.kilometraje_inicio}</TableCell>
                <TableCell>{row.kilometraje_fin}</TableCell>
                <TableCell>{new Date(row.fecha).toLocaleString()}</TableCell>
                <TableCell>{row.nombre_conductor}</TableCell>
                <TableCell>{row.vehiculo}</TableCell>
                <TableCell>{row.motivo_uso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
