import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function NavigationMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [pinModalOpen, setPinModalOpen] = React.useState(false);
  const [pin, setPin] = React.useState('');
  const [authenticated, setAuthenticated] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/vehiculos' && !authenticated) {
      openPinModal();
    }
  }, [location.pathname, authenticated]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openPinModal = () => {
    setPin('');
    setPinModalOpen(true);
  };

  const closePinModal = () => {
    setPin('');
    setPinModalOpen(false);
    // si canceló y no está autenticado en /vehiculos, redirige
    if (location.pathname === '/vehiculos' && !authenticated) {
      navigate('/');
    }
  };

  const handleVehiculosClick = () => {
    handleMenuClose();
    if (authenticated) {
      navigate('/vehiculos');
    } else {
      openPinModal();
    }
  };

  const handlePinSubmit = () => {
    const PIN_CORRECTO = '44561';
    if (pin === PIN_CORRECTO) {
      setAuthenticated(true);
      setPinModalOpen(false);
      navigate('/vehiculos');
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kilometer Report
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                  Registrar kilometraje
                </MenuItem>
                <MenuItem component={Link} to="/kilometrajes" onClick={handleMenuClose}>
                  Registros
                </MenuItem>
                <MenuItem onClick={handleVehiculosClick}>
                  Vehículos
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/">
                Registrar kilometraje
              </Button>
              <Button color="inherit" component={Link} to="/kilometrajes">
                Registros
              </Button>
              <Button color="inherit" onClick={handleVehiculosClick}>
                Vehículos
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Modal para pedir PIN */}
      <Dialog open={pinModalOpen} onClose={closePinModal}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePinSubmit();
          }}
        >
          <DialogTitle>Introduce el PIN</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="PIN"
              type="password"
              fullWidth
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closePinModal}>Cancelar</Button>
            <Button type="submit">Aceptar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
