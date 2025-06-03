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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface Trip {
  id: number;
  boat: {
    id: number;
    name: string;
  };
  crewMembers: Array<{
    id: number;
    name: string;
    position: string;
  }>;
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
}

interface Boat {
  id: number;
  name: string;
}

interface CrewMember {
  id: number;
  name: string;
  position: string;
}

interface FishingBank {
  id: number;
  name: string;
  location: string;
}

interface FishType {
  id: number;
  name: string;
}

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [banks, setBanks] = useState<FishingBank[]>([]);
  const [fishTypes, setFishTypes] = useState<FishType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    boatId: '',
    crewMemberIds: [] as string[],
    departureDate: '',
    returnDate: '',
    bankVisits: [] as Array<{
      fishingBankId: string;
      arrivalDate: string;
      departureDate: string;
      fishCatches: Array<{
        fishTypeId: string;
        weight: string;
        quality: string;
      }>;
    }>
  });

  useEffect(() => {
    fetchTrips();
    fetchBoats();
    fetchCrewMembers();
    fetchBanks();
    fetchFishTypes();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке поездок:', error);
    }
  };

  const fetchBoats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/boats');
      setBoats(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке судов:', error);
    }
  };

  const fetchCrewMembers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/crew');
      setCrewMembers(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке членов экипажа:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/banks');
      setBanks(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке банок:', error);
    }
  };

  const fetchFishTypes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/fish/types');
      setFishTypes(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке типов рыбы:', error);
    }
  };

  const handleOpen = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        boatId: trip.boat.id.toString(),
        crewMemberIds: trip.crewMembers.map(member => member.id.toString()),
        departureDate: new Date(trip.departureDate).toISOString().split('T')[0],
        returnDate: new Date(trip.returnDate).toISOString().split('T')[0],
        bankVisits: trip.bankVisits.map(visit => ({
          fishingBankId: visit.fishingBank.id.toString(),
          arrivalDate: new Date(visit.arrivalDate).toISOString().split('T')[0],
          departureDate: new Date(visit.departureDate).toISOString().split('T')[0],
          fishCatches: visit.fishCatches.map(catch_ => ({
            fishTypeId: catch_.fishType.id.toString(),
            weight: catch_.weight.toString(),
            quality: catch_.quality
          }))
        }))
      });
    } else {
      setEditingTrip(null);
      setFormData({
        boatId: '',
        crewMemberIds: [],
        departureDate: '',
        returnDate: '',
        bankVisits: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTrip(null);
  };

  const handleAddBankVisit = () => {
    setFormData(prev => ({
      ...prev,
      bankVisits: [
        ...prev.bankVisits,
        {
          fishingBankId: '',
          arrivalDate: '',
          departureDate: '',
          fishCatches: []
        }
      ]
    }));
  };

  const handleRemoveBankVisit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bankVisits: prev.bankVisits.filter((_, i) => i !== index)
    }));
  };

  const handleAddFishCatch = (bankVisitIndex: number) => {
    setFormData(prev => ({
      ...prev,
      bankVisits: prev.bankVisits.map((visit, i) => 
        i === bankVisitIndex
          ? {
              ...visit,
              fishCatches: [
                ...visit.fishCatches,
                { fishTypeId: '', weight: '', quality: 'good' }
              ]
            }
          : visit
      )
    }));
  };

  const handleRemoveFishCatch = (bankVisitIndex: number, fishCatchIndex: number) => {
    setFormData(prev => ({
      ...prev,
      bankVisits: prev.bankVisits.map((visit, i) => 
        i === bankVisitIndex
          ? {
              ...visit,
              fishCatches: visit.fishCatches.filter((_, j) => j !== fishCatchIndex)
            }
          : visit
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await axios.put(`http://localhost:3000/api/trips/${editingTrip.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/trips', formData);
      }
      handleClose();
      fetchTrips();
    } catch (error) {
      console.error('Ошибка при сохранении поездки:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту поездку?')) {
      try {
        await axios.delete(`http://localhost:3000/api/trips/${id}`);
        fetchTrips();
      } catch (error) {
        console.error('Ошибка при удалении поездки:', error);
      }
    }
  };

  const getQualityInRussian = (quality: string): string => {
    switch (quality) {
      case 'excellent':
        return 'Отличное';
      case 'good':
        return 'Хорошее';
      case 'poor':
        return 'Плохое';
      default:
        return quality;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Рыболовные поездки</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить поездку
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Судно</TableCell>
              <TableCell>Члены экипажа</TableCell>
              <TableCell>Дата отплытия</TableCell>
              <TableCell>Дата возвращения</TableCell>
              <TableCell>Посещения банок</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{trip.boat.name}</TableCell>
                <TableCell>
                  {trip.crewMembers.map(member => (
                    <div key={member.id}>
                      {member.name} ({member.position})
                    </div>
                  ))}
                </TableCell>
                <TableCell>{new Date(trip.departureDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(trip.returnDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {trip.bankVisits.map(visit => (
                    <div key={visit.id}>
                      <strong>Банка: {visit.fishingBank.name}</strong>
                      <br />
                      Прибытие: {new Date(visit.arrivalDate).toLocaleDateString()}
                      <br />
                      Отплытие: {new Date(visit.departureDate).toLocaleDateString()}
                      <br />
                      Улов:
                      {visit.fishCatches.map(catch_ => (
                        <div key={catch_.id}>
                          {catch_.fishType.name} - {catch_.weight}кг ({getQualityInRussian(catch_.quality)})
                        </div>
                      ))}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(trip)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(trip.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingTrip ? 'Редактировать поездку' : 'Добавить новую поездку'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Судно</InputLabel>
                  <Select
                    value={formData.boatId}
                    onChange={(e) => setFormData({ ...formData, boatId: e.target.value })}
                    required
                  >
                    {boats.map((boat) => (
                      <MenuItem key={boat.id} value={boat.id}>
                        {boat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Члены экипажа</InputLabel>
                  <Select
                    multiple
                    value={formData.crewMemberIds}
                    onChange={(e) => setFormData({ ...formData, crewMemberIds: e.target.value as string[] })}
                    required
                  >
                    {crewMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name} ({member.position})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Дата отплытия"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  fullWidth
                  label="Дата возвращения"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>

              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Посещения банков
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddBankVisit}
                  sx={{ mb: 2 }}
                >
                  Добавить посещение банка
                </Button>

                {formData.bankVisits.map((visit, visitIndex) => (
                  <Box key={visitIndex} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <FormControl fullWidth>
                          <InputLabel>Банка</InputLabel>
                          <Select
                            value={visit.fishingBankId}
                            onChange={(e) => {
                              const newVisits = [...formData.bankVisits];
                              newVisits[visitIndex].fishingBankId = e.target.value;
                              setFormData({ ...formData, bankVisits: newVisits });
                            }}
                            required
                          >
                            {banks.map((bank) => (
                              <MenuItem key={bank.id} value={bank.id}>
                                {bank.name} ({bank.location})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Дата прибытия"
                          type="date"
                          value={visit.arrivalDate}
                          onChange={(e) => {
                            const newVisits = [...formData.bankVisits];
                            newVisits[visitIndex].arrivalDate = e.target.value;
                            setFormData({ ...formData, bankVisits: newVisits });
                          }}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Дата отплытия"
                          type="date"
                          value={visit.departureDate}
                          onChange={(e) => {
                            const newVisits = [...formData.bankVisits];
                            newVisits[visitIndex].departureDate = e.target.value;
                            setFormData({ ...formData, bankVisits: newVisits });
                          }}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Улов
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddFishCatch(visitIndex)}
                          sx={{ mb: 1 }}
                        >
                          Добавить улов
                        </Button>

                        {visit.fishCatches.map((fishCatch, catchIndex) => (
                          <Box key={catchIndex} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Box sx={{ flex: 4 }}>
                                <FormControl fullWidth>
                                  <InputLabel>Тип рыбы</InputLabel>
                                  <Select
                                    value={fishCatch.fishTypeId}
                                    onChange={(e) => {
                                      const newVisits = [...formData.bankVisits];
                                      newVisits[visitIndex].fishCatches[catchIndex].fishTypeId = e.target.value;
                                      setFormData({ ...formData, bankVisits: newVisits });
                                    }}
                                    required
                                  >
                                    {fishTypes.map((type) => (
                                      <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Box>

                              <Box sx={{ flex: 3 }}>
                                <TextField
                                  fullWidth
                                  label="Вес (кг)"
                                  type="number"
                                  value={fishCatch.weight}
                                  onChange={(e) => {
                                    const newVisits = [...formData.bankVisits];
                                    newVisits[visitIndex].fishCatches[catchIndex].weight = e.target.value;
                                    setFormData({ ...formData, bankVisits: newVisits });
                                  }}
                                  required
                                />
                              </Box>

                              <Box sx={{ flex: 3 }}>
                                <FormControl fullWidth>
                                  <InputLabel>Качество</InputLabel>
                                  <Select
                                    value={fishCatch.quality}
                                    onChange={(e) => {
                                      const newVisits = [...formData.bankVisits];
                                      newVisits[visitIndex].fishCatches[catchIndex].quality = e.target.value;
                                      setFormData({ ...formData, bankVisits: newVisits });
                                    }}
                                    required
                                  >
                                    <MenuItem value="excellent">Отличное</MenuItem>
                                    <MenuItem value="good">Хорошее</MenuItem>
                                    <MenuItem value="poor">Плохое</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>

                              <Box sx={{ flex: 1 }}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleRemoveFishCatch(visitIndex, catchIndex)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      <Box>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveBankVisit(visitIndex)}
                        >
                          Удалить посещение
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingTrip ? 'Сохранить изменения' : 'Добавить поездку'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Trips; 