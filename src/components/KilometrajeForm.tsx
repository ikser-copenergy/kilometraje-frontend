import { useState } from 'react';
import { TextField, Button, Stack, Alert } from '@mui/material';
import Swal from 'sweetalert2';
import { create } from '../services/KilometrajeService';
import dayjs from 'dayjs';
import type { Kilometraje } from '../types/Kilometraje';

// Definimos un tipo con todo menos el ID, que es autogenerado
type KilometrajeFormData = Omit<Kilometraje, 'id'>;

export const KilometrajeForm = () => {
  const [form, setForm] = useState<KilometrajeFormData>({
    kilometraje_inicio: 0,
    kilometraje_fin: 0,
    fecha: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
    nombre_conductor: '',
    vehiculo: '',
    motivo_uso: '',
  });

  const [alert, setAlert] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('kilometraje') ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    const { kilometraje_inicio, kilometraje_fin } = form;
    const diferencia = kilometraje_fin - kilometraje_inicio;

    if (kilometraje_fin <= kilometraje_inicio) {
      setAlert('El kilometraje final debe ser mayor que el inicial');
      return;
    }

    if (diferencia > 100) {
      const confirmacion = await Swal.fire({
        title: 'Kilometraje sospechoso',
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
        setAlert('Registro guardado correctamente');
      } else {
        setAlert(res.data.message || 'Error desconocido al guardar');
      }
    } catch (err: any) {
      console.error(err?.response?.data);
      setAlert('Error al guardar el registro');
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 500 }}>
      {alert && <Alert severity="info">{alert}</Alert>}
      <TextField
        label="Kilometraje Inicial"
        name="kilometraje_inicio"
        type="number"
        value={form.kilometraje_inicio}
        onChange={handleChange}
      />
      <TextField
        label="Kilometraje Final"
        name="kilometraje_fin"
        type="number"
        value={form.kilometraje_fin}
        onChange={handleChange}
      />
      <TextField
        label="Nombre del Conductor"
        name="nombre_conductor"
        value={form.nombre_conductor}
        onChange={handleChange}
      />
      <TextField
        label="Vehículo"
        name="vehiculo"
        value={form.vehiculo}
        onChange={handleChange}
      />
      <TextField
        label="Motivo de Uso"
        name="motivo_uso"
        value={form.motivo_uso}
        onChange={handleChange}
      />
      <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
    </Stack>
  );
};
