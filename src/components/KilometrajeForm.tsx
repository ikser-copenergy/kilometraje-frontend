import { useState, useEffect } from 'react';
import { TextField, Button, Stack, Alert, MenuItem } from '@mui/material';
import Swal from 'sweetalert2';
import { create } from '../services/KilometrajeService';
import { getAll } from '../services/VehiculoService';

import dayjs from 'dayjs';
import type { Kilometraje } from '../types/Kilometraje';
import type { Vehiculo } from '../types/vehiculo';

type KilometrajeFormData = Omit<Kilometraje, 'id' | 'vehiculo'>;

type AlertState = {
  message: string;
  severity: 'success' | 'error';
};

export const KilometrajeForm = () => {
  const [form, setForm] = useState<KilometrajeFormData>({
    kilometraje_inicio: 0,
    kilometraje_fin: 0,
    fecha: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    nombre_conductor: '',
    motivo_uso: '',
    id_vehiculo: 0,
  });

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof KilometrajeFormData, string>>>({});
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  // Auto-dismiss success alerts after 3 seconds
  useEffect(() => {
    if (alertState?.severity === 'success') {
      const timer = setTimeout(() => setAlertState(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertState]);

  useEffect(() => {
    getAll()
      .then(res => {
        if (res.data.success && res.data.data) {
          setVehiculos(res.data.data);
        }
      })
      .catch(error => {
        console.error('Error cargando vehículos', error);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'kilometraje_inicio' || name === 'kilometraje_fin') {
      const onlyDigits = value.replace(/\D/g, '');
      const cleaned = onlyDigits.replace(/^0+(?=\d)/, '');
      const intVal = cleaned === '' ? 0 : parseInt(cleaned, 10);
      setForm(prev => ({ ...prev, [name]: intVal }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } else if (name === 'id_vehiculo') {
      setForm(prev => ({ ...prev, id_vehiculo: parseInt(value, 10) }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setAlertState(null);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    (Object.keys(form) as (keyof KilometrajeFormData)[]).forEach(key => {
      const val = form[key];
      if (
        val === '' || val == null ||
        (typeof val === 'number' && isNaN(val)) ||
        (key !== 'fecha' && val === 0)
      ) {
        newErrors[key] = 'Campo obligatorio';
      }
    });
    if (!newErrors.kilometraje_inicio && !newErrors.kilometraje_fin) {
      const { kilometraje_inicio, kilometraje_fin } = form;
      if (kilometraje_fin <= kilometraje_inicio) {
        newErrors.kilometraje_fin = 'El kilometraje final debe ser mayor que el inicial';
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setAlertState({ message: 'No deben haber campos vacíos.', severity: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const diferencia = form.kilometraje_fin - form.kilometraje_inicio;
    if (diferencia > 100) {
      const confirmacion = await Swal.fire({
        title: 'Kilometraje alto',
        text: `La diferencia es ${diferencia} km. ¿Deseas continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No'
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      const res = await create(form);
      if (res.data.success) {
        setAlertState({ message: 'Registro guardado correctamente', severity: 'success' });
        setForm({
          kilometraje_inicio: 0,
          kilometraje_fin: 0,
          fecha: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          nombre_conductor: '',
          motivo_uso: '',
          id_vehiculo: 0,
        });
      } else {
        setAlertState({ message: res.data.message || 'Error desconocido al guardar', severity: 'error' });
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setAlertState({ message: message || 'Error al guardar el registro', severity: 'error' });
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 500 }}>
      {alertState && <Alert severity={alertState.severity}>{alertState.message}</Alert>}
      <TextField
        label="Kilometraje Inicial"
        name="kilometraje_inicio"
        type="number"
        placeholder="0"
        value={form.kilometraje_inicio === 0 ? '' : form.kilometraje_inicio}
        onChange={handleChange}
        error={Boolean(errors.kilometraje_inicio)}
        helperText={errors.kilometraje_inicio}
        inputProps={{ inputMode: 'numeric', pattern: '\\d*', step: 1 }}
      />
      <TextField
        label="Kilometraje Final"
        name="kilometraje_fin"
        type="number"
        placeholder="0"
        value={form.kilometraje_fin === 0 ? '' : form.kilometraje_fin}
        onChange={handleChange}
        error={Boolean(errors.kilometraje_fin)}
        helperText={errors.kilometraje_fin}
        inputProps={{ inputMode: 'numeric', pattern: '\\d*', step: 1 }}
      />
      <TextField
        label="Fecha y hora"
        name="fecha"
        type="datetime-local"
        value={form.fecha}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={Boolean(errors.fecha)}
        helperText={errors.fecha}
      />
      <TextField
        label="Nombre del Conductor"
        name="nombre_conductor"
        value={form.nombre_conductor}
        onChange={handleChange}
        error={Boolean(errors.nombre_conductor)}
        helperText={errors.nombre_conductor}
      />
      <TextField
        select
        label="Vehículo"
        name="id_vehiculo"
        value={form.id_vehiculo === 0 ? '' : form.id_vehiculo}
        onChange={handleChange}
        error={Boolean(errors.id_vehiculo)}
        helperText={errors.id_vehiculo}
      >
        {vehiculos.map(vehiculo => (
          <MenuItem key={vehiculo.id} value={vehiculo.id}>
            {vehiculo.codigo} - {vehiculo.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Motivo de Uso"
        name="motivo_uso"
        value={form.motivo_uso}
        onChange={handleChange}
        error={Boolean(errors.motivo_uso)}
        helperText={errors.motivo_uso}
      />
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
      >
        Guardar
      </Button>
    </Stack>
  );
};
