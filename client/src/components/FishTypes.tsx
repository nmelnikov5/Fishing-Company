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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import axios from 'axios';

interface FishType {
  id: number;
  name: string;
  totalWeight: number;
  fishCatches?: Array<{
    id: number;
    weight: number;
    quality: string;
    bankVisit: {
      id: number;
      arrivalDate: string;
      departureDate: string;
      fishingTrip: {
        id: number;
        departureDate: string;
        returnDate: string;
        boat: {
          id: number;
          name: string;
        };
      };
      fishingBank: {
        id: number;
        name: string;
      };
    };
  }>;
}

const FishTypes: React.FC = () => {
  const [fishTypes, setFishTypes] = useState<FishType[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFishType, setSelectedFishType] = useState<FishType | null>(null);
  const [editingFishType, setEditingFishType] = useState<FishType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchFishTypes();
  }, []);

  const fetchFishTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/fish/types');
      setFishTypes(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке видов рыбы:', error);
    }
  };

  const handleOpen = (fishType?: FishType) => {
    if (fishType) {
      setEditingFishType(fishType);
      setFormData({
        name: fishType.name,
      });
    } else {
      setEditingFishType(null);
      setFormData({
        name: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFishType(null);
  };

  const handleDetailsOpen = async (fishType: FishType) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/fish/types/${fishType.id}`);
      setSelectedFishType(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке деталей вида рыбы:', error);
    }
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedFishType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFishType) {
        await axios.put(`http://localhost:3000/api/fish/types/${editingFishType.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/fish/types', formData);
      }
      handleClose();
      fetchFishTypes();
    } catch (error) {
      console.error('Ошибка при сохранении вида рыбы:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вид рыбы?')) {
      try {
        await axios.delete(`http://localhost:3000/api/fish/types/${id}`);
        fetchFishTypes();
      } catch (error) {
        console.error('Ошибка при удалении вида рыбы:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Виды рыбы</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить вид рыбы
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Общий вес улова (кг)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fishTypes.map((fishType) => (
              <TableRow 
                key={fishType.id}
                onClick={() => handleDetailsOpen(fishType)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>{fishType.name}</TableCell>
                <TableCell>{fishType.totalWeight.toFixed(1)}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleOpen(fishType); }} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(fishType.id); }} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модальное окно для добавления/редактирования */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingFishType ? 'Редактировать вид рыбы' : 'Добавить новый вид рыбы'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingFishType ? 'Сохранить изменения' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Модальное окно с деталями вида рыбы */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            {selectedFishType?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Левая часть - информация о виде рыбы */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Информация о виде рыбы
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Общий вес улова: {selectedFishType?.totalWeight.toFixed(1)} кг
                </Typography>
              </Box>
            </Box>

            {/* Правая часть - история уловов */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                История уловов
              </Typography>
              {Array.from(new Set(selectedFishType?.fishCatches?.map(catch_ => catch_.bankVisit.fishingTrip.id))).map(tripId => {
                const tripCatches = selectedFishType?.fishCatches?.filter(catch_ => catch_.bankVisit.fishingTrip.id === tripId);
                const firstCatch = tripCatches?.[0];
                
                return (
                  <Accordion key={tripId}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ backgroundColor: '#f5f5f5' }}
                    >
                      <Typography>
                        {new Date(firstCatch?.bankVisit.fishingTrip.departureDate || '').toLocaleDateString()} - {new Date(firstCatch?.bankVisit.fishingTrip.returnDate || '').toLocaleDateString()}
                        {' | '}
                        Катер: {firstCatch?.bankVisit.fishingTrip.boat.name}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {tripCatches?.map((catch_) => (
                        <Box 
                          key={catch_.id}
                          sx={{ 
                            mb: 2,
                            p: 1,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            backgroundColor: '#fff'
                          }}
                        >
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Банка: {catch_.bankVisit.fishingBank.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Typography variant="body2">
                              Прибытие: {new Date(catch_.bankVisit.arrivalDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              Отплытие: {new Date(catch_.bankVisit.departureDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                            Улов:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                backgroundColor: '#f0f0f0',
                                padding: '2px 8px',
                                borderRadius: 1
                              }}
                            >
                              {catch_.weight} кг ({catch_.quality === 'excellent' ? 'Отличное' : 
                                               catch_.quality === 'good' ? 'Хорошее' : 
                                               catch_.quality === 'average' ? 'Среднее' : 
                                               catch_.quality === 'poor' ? 'Плохое' : 
                                               catch_.quality})
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
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

export default FishTypes; 