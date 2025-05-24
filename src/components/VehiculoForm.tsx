import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  IconButton,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Tooltip,
  Box
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getAll, create, update, remove } from '../services/VehiculoService';
import type { Vehiculo } from '../types/Vehiculo';

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
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
    setErrors({});
    setAlertState(null);
    if (vehiculo) {
      setForm({ codigo: vehiculo.codigo, nombre: vehiculo.nombre });
      setEditingId(vehiculo.id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setOpen(true);
  };

  // Solo cierra, reseteamos tras animación
  const handleClose = () => {
    setOpen(false);
  };
  const handleAfterClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setAlertState(null);
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

    const existeCodigo = vehiculos.some(v =>
      v.codigo === form.codigo && (editingId === null || v.id !== editingId)
    );
    if (!newErrors.codigo && existeCodigo) {
      newErrors.codigo = 'Ya existe un vehículo con ese código';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setAlertState({ message: 'Corrige los errores antes de continuar.', severity: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      let response;
      if (editingId !== null) response = await update(editingId, form);
      else response = await create(form);

      if (response.data.success) {
        setAlertState({ message: 'Guardado correctamente', severity: 'success' });
        setTimeout(() => {
          setOpen(false);
          loadData();
        }, 300);
      } else {
        setAlertState({ message: response.data.message, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setAlertState({ message: 'Error inesperado al guardar', severity: 'error' });
    }
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (toDeleteId === null) return;
    try {
      const response = await remove(toDeleteId);
      if (response.data.success) {
        setAlertState({ message: 'Vehículo eliminado correctamente', severity: 'success' });
        loadData();
      } else {
        setAlertState({ message: response.data.message, severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setAlertState({ message: 'Error al eliminar el vehículo', severity: 'error' });
    } finally {
      setDeleteOpen(false);
      setToDeleteId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Vehículos</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Nuevo Vehículo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>Código</strong></TableCell>
              <TableCell align="left"><strong>Nombre</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehiculos.map((vehiculo) => (
              <TableRow key={vehiculo.id}>
                <TableCell align="center">{vehiculo.codigo}</TableCell>
                <TableCell align="left">{vehiculo.nombre}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleOpen(vehiculo)} aria-label="editar">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => confirmDelete(vehiculo.id)} aria-label="eliminar">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {vehiculos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay vehículos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Crear/Editar */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        TransitionProps={{ onExited: handleAfterClose }}
      >
        <DialogTitle>
          {editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </DialogTitle>
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
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eliminar */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>  
        <DialogTitle>Eliminar Vehículo</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este vehículo?</Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => setDeleteOpen(false)}>No, Conservar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Sí, Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};