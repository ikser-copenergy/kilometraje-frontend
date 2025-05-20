import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationMenu } from './components/NavigationMenu';
import { KilometrajeTable } from './components/KilometrajeTable';
import KilometrajePage from './pages/KilometrajePage';
import { VehiculoCrud } from './components/VehiculoForm';

function App() {
  return (
    <Router>
      <NavigationMenu />
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<KilometrajePage />} />
          <Route path="/kilometrajes" element={<KilometrajeTable />} />
          <Route path="/vehiculos" element={<VehiculoCrud />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

