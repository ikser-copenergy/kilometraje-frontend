// src/components/EditKilometrajeModal.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Stack,
  MenuItem,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Kilometraje } from '../types/Kilometraje';
import type { Vehiculo } from '../types/Vehiculo';
import * as KilometrajeService from '../services/KilometrajeService';
import * as VehiculoService from '../services/VehiculoService';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData: Kilometraje | null;
  onUpdated: () => void;
}

export const EditKilometrajeModal = ({ open, onClose, initialData, onUpdated }: Props) => {
  const [form, setForm] = useState<Omit<Kilometraje, 'vehiculo'>>({
    id: 0,
    kilometraje_inicio: 0,
    kilometraje_fin: 0,
    fecha: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    nombre_conductor: '',
    motivo_uso: '',
    id_vehiculo: 0,
  });
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  // Cargar lista de vehículos al montar
  useEffect(() => {
    VehiculoService.getAll()
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setVehiculos(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error cargando vehículos en modal de edición', err);
      });
  }, []);

  // Cargar datos del registro al abrir
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        kilometraje_inicio: initialData.kilometraje_inicio,
        kilometraje_fin: initialData.kilometraje_fin,
        fecha: dayjs(initialData.fecha).format('YYYY-MM-DDTHH:mm:ss'),
        nombre_conductor: initialData.nombre_conductor,
        motivo_uso: initialData.motivo_uso,
        id_vehiculo: initialData.id_vehiculo,
      });
      setErrors({});
      setAlert(null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsed: any = value;
    if (['kilometraje_inicio', 'kilometraje_fin', 'id_vehiculo'].includes(name)) {
      parsed = parseInt(value, 10) || 0;
    }
    setForm(f => ({ ...f, [name]: parsed }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setAlert(null);
  };

  const validate = () => {
    const newErr: typeof errors = {};
    (['kilometraje_inicio','kilometraje_fin','fecha','nombre_conductor','motivo_uso','id_vehiculo'] as (keyof typeof form)[])
      .forEach(key => {
        const v = form[key];
        if (v === '' || v == null || (typeof v === 'number' && v === 0 && key !== 'id_vehiculo')) {
          newErr[key] = 'Campo obligatorio';
        }
      });
    if (!newErr.kilometraje_inicio && !newErr.kilometraje_fin && form.kilometraje_fin <= form.kilometraje_inicio) {
      newErr.kilometraje_fin = 'Debe ser mayor que el inicial';
    }
    setErrors(newErr);
    if (Object.keys(newErr).length) {
      setAlert({ severity: 'error', message: 'Por favor corrige los errores.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await KilometrajeService.update(form.id, {
        kilometraje_inicio: form.kilometraje_inicio,
        kilometraje_fin: form.kilometraje_fin,
        fecha: form.fecha,
        nombre_conductor: form.nombre_conductor,
        motivo_uso: form.motivo_uso,
        id_vehiculo: form.id_vehiculo,
      });
      if (res.data.success) {
        setAlert({ severity: 'success', message: 'Registro actualizado.' });
        onUpdated();
        setTimeout(onClose, 500);
      } else {
        setAlert({ severity: 'error', message: res.data.message || 'Fallo al actualizar.' });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error de conexión con el servidor';
      setAlert({ severity: 'error', message: msg });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Kilometraje</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {alert && <Alert severity={alert.severity}>{alert.message}</Alert>}

          <TextField
            label="Kilometraje Inicial"
            name="kilometraje_inicio"
            type="number"
            value={form.kilometraje_inicio}
            onChange={handleChange}
            error={!!errors.kilometraje_inicio}
            helperText={errors.kilometraje_inicio}
            inputProps={{ step: 1 }}
          />

          <TextField
            label="Kilometraje Final"
            name="kilometraje_fin"
            type="number"
            value={form.kilometraje_fin}
            onChange={handleChange}
            error={!!errors.kilometraje_fin}
            helperText={errors.kilometraje_fin}
            inputProps={{ step: 1 }}
          />

          <TextField
            label="Fecha y hora"
            name="fecha"
            type="datetime-local"
            value={form.fecha}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.fecha}
            helperText={errors.fecha}
          />

          <TextField
            label="Nombre del Conductor"
            name="nombre_conductor"
            value={form.nombre_conductor}
            onChange={handleChange}
            error={!!errors.nombre_conductor}
            helperText={errors.nombre_conductor}
          />

          <TextField
            select
            label="Vehículo"
            name="id_vehiculo"
            value={form.id_vehiculo || ''}
            onChange={handleChange}
            error={!!errors.id_vehiculo}
            helperText={errors.id_vehiculo || 'Selecciona el vehículo'}
          >
            {vehiculos.map(v => (
              <MenuItem key={v.id} value={v.id}>
                {v.codigo} – {v.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Motivo de Uso"
            name="motivo_uso"
            value={form.motivo_uso}
            onChange={handleChange}
            error={!!errors.motivo_uso}
            helperText={errors.motivo_uso}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
