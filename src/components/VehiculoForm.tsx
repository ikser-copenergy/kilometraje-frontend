import { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Stack, IconButton, Typography,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { getAll, create, update, remove } from '../services/VehiculoService';
import type { Vehiculo } from '../types/vehiculo';

type AlertState = {
  message: string;
  severity: 'success' | 'error';
};

const emptyForm: Omit<Vehiculo, 'id'> = { codigo: '', nombre: '' };

export const VehiculoCrud = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [form, setForm] = useState<Omit<Vehiculo, 'id'>>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Vehiculo, string>>>({});

  const loadData = async () => {
    const res = await getAll();
    if (res.data?.success) setVehiculos(res.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setForm({ codigo: vehiculo.codigo, nombre: vehiculo.nombre });
      setEditingId(vehiculo.id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setErrors({});
    setAlertState(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setAlertState(null);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.codigo.trim()) newErrors.codigo = 'Campo obligatorio';
    if (!form.nombre.trim()) newErrors.nombre = 'Campo obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      let response;
      if (editingId !== null) {
        response = await update(editingId, form);
      } else {
        response = await create(form);
      }

      if (response.data.success) {
        setAlertState({ message: 'Guardado correctamente', severity: 'success' });
        handleClose();
        loadData();
      } else {
        setAlertState({ message: response.data.message, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setAlertState({ message: 'Error inesperado al guardar', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await remove(id);
      if (response.data.success) {
        await loadData();
        Swal.fire('Eliminado', 'Vehículo eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al eliminar el vehículo', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Vehículos</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
        Nuevo Vehículo
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>ID</strong></TableCell>
              <TableCell align="center"><strong>Código</strong></TableCell>
              <TableCell align="center"><strong>Nombre</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehiculos.map((vehiculo) => (
              <TableRow key={vehiculo.id}>
                <TableCell align="center">{vehiculo.id}</TableCell>
                <TableCell align="center">{vehiculo.codigo}</TableCell>
                <TableCell align="center">{vehiculo.nombre}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpen(vehiculo)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(vehiculo.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {vehiculos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay vehículos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
        <DialogContent>
          {alertState && (
            <Alert severity={alertState.severity} sx={{ mb: 2 }}>
              {alertState.message}
            </Alert>
          )}
          <TextField
            label="Código"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.codigo}
            helperText={errors.codigo}
          />
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.nombre}
            helperText={errors.nombre}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
