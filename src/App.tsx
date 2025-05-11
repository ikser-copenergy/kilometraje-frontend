import { Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationMenu } from './components/NavigationMenu';
import { KilometrajeTable } from './components/KilometrajeTable';
import KilometrajePage from './pages/KilometrajePage';

function App() {
  return (
    <Router>
      <NavigationMenu />
      <Container sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/" element={<KilometrajeTable />} />
          <Route path="/kilometraje" element={<KilometrajePage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

