import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import axios from 'axios';

interface Boat {
  id: number;
  name: string;
  type: string;
  displacement: number;
  buildDate: string;
  fishingTrips?: Array<{
    id: number;
    departureDate: string;
    returnDate: string;
    bankVisits: Array<{
      id: number;
      fishingBank: {
        id: number;
        name: string;
      };
      arrivalDate: string;
      departureDate: string;
      fishCatches: Array<{
        id: number;
        fishType: {
          id: number;
          name: string;
        };
        weight: number;
        quality: string;
      }>;
    }>;
  }>;
}

const getQualityInRussian = (quality: string): string => {
  console.log('Original quality:', quality); // Отладочный вывод
  const qualityMap: { [key: string]: string } = {
    'EXCELLENT': 'Отличное',
    'GOOD': 'Хорошее',
    'AVERAGE': 'Среднее',
    'POOR': 'Плохое',
    'excellent': 'Отличное',
    'good': 'Хорошее',
    'average': 'Среднее',
    'poor': 'Плохое'
  };
  const translated = qualityMap[quality] || quality;
  console.log('Translated quality:', translated); // Отладочный вывод
  return translated;
};

const Boats: React.FC = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    displacement: '',
    buildDate: ''
  });

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/boats');
      setBoats(response.data);
    } catch (error) {
      console.error('Error fetching boats:', error);
    }
  };

  const handleOpen = (boat?: Boat) => {
    if (boat) {
      setEditingBoat(boat);
      setFormData({
        name: boat.name,
        type: boat.type,
        displacement: boat.displacement.toString(),
        buildDate: new Date(boat.buildDate).toISOString().split('T')[0]
      });
    } else {
      setEditingBoat(null);
      setFormData({
        name: '',
        type: '',
        displacement: '',
        buildDate: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBoat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBoat) {
        await axios.put(`http://localhost:3000/api/boats/${editingBoat.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/boats', formData);
      }
      handleClose();
      fetchBoats();
    } catch (error) {
      console.error('Error saving boat:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this boat?')) {
      try {
        await axios.delete(`http://localhost:3000/api/boats/${id}`);
        fetchBoats();
      } catch (error) {
        console.error('Error deleting boat:', error);
      }
    }
  };

  const handleDetailsOpen = async (boat: Boat) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/boats/${boat.id}`);
      console.log('Boat data:', response.data); // Отладочный вывод
      setSelectedBoat(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching boat details:', error);
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedBoat(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Управление катерами</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Добавить новый катер
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Водоизмещение</TableCell>
              <TableCell>Дата постройки</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boats.map((boat) => (
              <TableRow 
                key={boat.id}
                onClick={() => handleDetailsOpen(boat)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>{boat.name}</TableCell>
                <TableCell>{boat.type}</TableCell>
                <TableCell>{boat.displacement}</TableCell>
                <TableCell>{new Date(boat.buildDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleOpen(boat); }} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(boat.id); }} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingBoat ? 'Редактировать катер' : 'Добавить новый катер'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Тип"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Водоизмещение"
              type="number"
              value={formData.displacement}
              onChange={(e) => setFormData({ ...formData, displacement: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Дата постройки"
              type="date"
              value={formData.buildDate}
              onChange={(e) => setFormData({ ...formData, buildDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Отменить</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingBoat ? 'Сохранить изменения' : 'Добавить катер'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            {selectedBoat?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Паспорт катера
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Тип: {selectedBoat?.type}
                </Typography>
                <Typography variant="subtitle1">
                  Водоизмещение: {selectedBoat?.displacement} тонн
                </Typography>
                <Typography variant="subtitle1">
                  Дата постройки: {selectedBoat?.buildDate ? new Date(selectedBoat.buildDate).toLocaleDateString() : ''}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                История поездок
              </Typography>
              {selectedBoat?.fishingTrips?.map((trip) => (
                <Accordion key={trip.id}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: '#f5f5f5' }}
                  >
                    <Typography>
                      {new Date(trip.departureDate).toLocaleDateString()} - {new Date(trip.returnDate).toLocaleDateString()}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {trip.bankVisits.map((visit) => (
                      <Box 
                        key={visit.id} 
                        sx={{ 
                          mb: 2,
                          p: 1,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          backgroundColor: '#fff'
                        }}
                      >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Банка: {visit.fishingBank.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Typography variant="body2">
                            Прибытие: {new Date(visit.arrivalDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            Отплытие: {new Date(visit.departureDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Улов:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          {visit.fishCatches.map((catch_) => (
                            <Typography 
                              key={catch_.id} 
                              variant="body2"
                              sx={{ 
                                backgroundColor: '#f0f0f0',
                                padding: '2px 8px',
                                borderRadius: 1
                              }}
                            >
                              {catch_.fishType.name} - {catch_.weight}кг ({catch_.quality === 'excellent' ? 'Отличное' : 
                                                                            catch_.quality === 'good' ? 'Хорошее' : 
                                                                            catch_.quality === 'average' ? 'Среднее' : 
                                                                            catch_.quality === 'poor' ? 'Плохое' : 
                                                                            catch_.quality})
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Boats; 