import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Boats from './components/Boats';
import Trips from './components/Trips';
import Banks from './components/Banks';
import Crew from './components/Crew';
import FishTypes from './components/FishTypes';
import Statistics from './components/Statistics';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Fishing Company
              </Typography>
              <Button color="inherit" component={Link} to="/boats">
                Катера
              </Button>
              <Button color="inherit" component={Link} to="/trips">
                Рыболовные поездки
              </Button>
              <Button color="inherit" component={Link} to="/banks">
                Рыболовные банки
              </Button>
              <Button color="inherit" component={Link} to="/crew">
                Команда
              </Button>
              <Button color="inherit" component={Link} to="/fish-types">
                Сорта рыбы
              </Button>
              <Button color="inherit" component={Link} to="/statistics">
                Статистика
              </Button>
            </Toolbar>
          </AppBar>
          
          <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Routes>
              <Route path="/" element={<Typography variant="h4">Welcome to Fishing Company Management System</Typography>} />
              <Route path="/boats" element={<Boats />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/banks" element={<Banks />} />
              <Route path="/crew" element={<Crew />} />
              <Route path="/fish-types" element={<FishTypes />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </Container>

          <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200] }}>
            <Container maxWidth="sm">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Fishing Company Management System
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
