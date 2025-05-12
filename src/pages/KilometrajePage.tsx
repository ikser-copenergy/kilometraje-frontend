import { KilometrajeForm } from '../components/KilometrajeForm';
import { Stack, Typography } from '@mui/material';


export default function KilometrajePage() {
  return (
    <Stack spacing={4}>
      <Typography variant="h5">Reportar Kilometraje</Typography>
      <KilometrajeForm />
    </Stack>
  );
}