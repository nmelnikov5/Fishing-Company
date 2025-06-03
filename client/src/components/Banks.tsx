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
  Container,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import axios from 'axios';

interface Bank {
  id: number;
  name: string;
  location: string;
  description: string;
  bankVisits: Array<{
    id: number;
    arrivalDate: string;
    departureDate: string;
    fishingTrip: {
      boat: {
        id: number;
        name: string;
      };
    };
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
  overallAverageCatch?: number;
}

interface AboveAverageBoat {
  boat: {
    id: number;
    name: string;
  };
  averageCatch: number;
}

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [aboveAverageBoats, setAboveAverageBoats] = useState<AboveAverageBoat[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/banks');
      setBanks(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке банок:', error);
    }
  };

  const fetchAboveAverageBoats = async (bankId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/banks/${bankId}/above-average-boats`);
      setAboveAverageBoats(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке катеров с уловом выше среднего:', error);
    }
  };

  const handleOpen = (bank?: Bank) => {
    if (bank) {
      setEditingBank(bank);
      setFormData({
        name: bank.name,
        location: bank.location,
        description: bank.description || ''
      });
    } else {
      setEditingBank(null);
      setFormData({
        name: '',
        location: '',
        description: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBank(null);
  };

  const handleDetailsOpen = async (bank: Bank) => {
    console.log('Bank data:', bank);
    try {
      const response = await axios.get(`http://localhost:3000/api/banks/${bank.id}`);
      setSelectedBank(response.data);
      setDetailsOpen(true);
      await fetchAboveAverageBoats(bank.id);
    } catch (error) {
      console.error('Ошибка при загрузке деталей банки:', error);
      alert('Произошла ошибка при загрузке деталей банки');
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedBank(null);
    setAboveAverageBoats([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBank) {
        await axios.put(`http://localhost:3000/api/banks/${editingBank.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/banks', formData);
      }
      handleClose();
      fetchBanks();
    } catch (error) {
      console.error('Ошибка при сохранении банки:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту банку?')) {
      try {
        await axios.delete(`http://localhost:3000/api/banks/${id}`);
        fetchBanks();
      } catch (error) {
        console.error('Ошибка при удалении банки:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Рыболовные банки</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить банку
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Расположение</TableCell>
              <TableCell>Посещения</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banks.map((bank) => (
              <TableRow key={bank.id}>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => handleDetailsOpen(bank)}
                    sx={{ textTransform: 'none' }}
                  >
                    {bank.name}
                  </Button>
                </TableCell>
                <TableCell>{bank.location}</TableCell>
                <TableCell>
                  {bank.bankVisits.length} посещений
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(bank)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(bank.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for editing/adding bank */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBank ? 'Редактировать банку' : 'Добавить новую банку'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              label="Расположение"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              placeholder="Введите описание банки..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingBank ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for bank details */}
      <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5">Детали банки: {selectedBank?.name}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Левая часть - информация о банке */}
            <Box sx={{ 
              width: { xs: '100%', md: '30%' },
              p: 2,
              borderRight: { md: '1px solid #ddd' }
            }}>
              <Typography variant="h6" gutterBottom>
                Информация о банке
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" paragraph>
                  <strong>Название:</strong> {selectedBank?.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Расположение:</strong> {selectedBank?.location}
                </Typography>
                {selectedBank?.overallAverageCatch !== undefined && (
                  <Typography variant="body1" paragraph>
                    <strong>Средний улов:</strong> {selectedBank?.overallAverageCatch.toFixed(2)} кг
                  </Typography>
                )}
                <Typography variant="body1" paragraph>
                  <strong>Описание:</strong>
                  <Box sx={{ 
                    mt: 1, 
                    p: 2, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    minHeight: '100px'
                  }}>
                    {selectedBank?.description || 'Описание отсутствует'}
                  </Box>
                </Typography>
              </Box>
            </Box>

            {/* Правая часть - история посещений и катеры с уловом выше среднего */}
            <Box sx={{ 
              width: { xs: '100%', md: '70%' },
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {/* Секция Катеры с уловом выше среднего */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Катеры с уловом выше среднего
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Название катера</TableCell>
                        <TableCell>Средний улов (кг)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {aboveAverageBoats.map((boat) => (
                        <TableRow key={boat.boat.id}>
                          <TableCell>{boat.boat.name}</TableCell>
                          <TableCell>{boat.averageCatch.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Секция История посещений */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  История посещений
                </Typography>
                {selectedBank?.bankVisits.map((visit) => (
                  <Accordion key={visit.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>
                          {new Date(visit.arrivalDate).toLocaleDateString()} - {new Date(visit.departureDate).toLocaleDateString()}
                        </Typography>
                        {visit.fishingTrip?.boat && (
                          <Typography color="primary">
                            Катер: {visit.fishingTrip.boat.name}
                          </Typography>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Улов:
                      </Typography>
                      {visit.fishCatches.map((catch_) => {
                        const totalWeight = selectedBank.bankVisits.reduce((sum, v) => {
                          return sum + v.fishCatches
                            .filter(fc => fc.fishType.id === catch_.fishType.id)
                            .reduce((catchSum, fc) => catchSum + fc.weight, 0);
                        }, 0);

                        return (
                          <Typography key={catch_.id} variant="body2" sx={{ ml: 2, mb: 1 }}>
                            • {catch_.fishType.name} - {catch_.weight}кг ({catch_.quality === 'excellent' ? 'Отличное' : 
                                                                          catch_.quality === 'good' ? 'Хорошее' : 
                                                                          catch_.quality === 'average' ? 'Среднее' : 
                                                                          catch_.quality === 'poor' ? 'Плохое' : 
                                                                          catch_.quality})
                          </Typography>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
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

export default Banks; 