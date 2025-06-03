import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface FishCatchStats {
  fishType: {
    id: number;
    name: string;
  };
  boat: {
    id: number;
    name: string;
  };
  totalCatch: number;
}

interface BankStats {
  bank: {
    id: number;
    name: string;
  };
  averageCatch: number;
}

const Statistics: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fishCatchStats, setFishCatchStats] = useState<FishCatchStats[]>([]);
  const [bankStats, setBankStats] = useState<BankStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatistics = async () => {
    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите интервал дат');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching statistics with dates:', { startDate, endDate });
      const [fishResponse, bankResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/statistics/fish-catch`, {
          params: { startDate, endDate }
        }),
        axios.get(`http://localhost:3000/api/statistics/bank-catch`, {
          params: { startDate, endDate }
        })
      ]);

      console.log('Fish catch response:', fishResponse.data);
      console.log('Bank catch response:', bankResponse.data);

      setFishCatchStats(fishResponse.data);
      setBankStats(bankResponse.data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      alert('Произошла ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Статистика уловов</Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Начальная дата"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Конечная дата"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          onClick={fetchStatistics}
          disabled={loading}
        >
          Показать статистику
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Наибольший улов по сортам рыбы</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Сорт рыбы</TableCell>
                    <TableCell>Катер</TableCell>
                    <TableCell>Общий улов (кг)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fishCatchStats.map((stat, index) => (
                    <TableRow key={`${stat.fishType.id}-${stat.boat.id}-${index}`}>
                      <TableCell>{stat.fishType.name}</TableCell>
                      <TableCell>{stat.boat.name}</TableCell>
                      <TableCell>{stat.totalCatch.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Средний улов по банкам</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Банка</TableCell>
                    <TableCell>Средний улов (кг)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bankStats.map((stat) => (
                    <TableRow key={stat.bank.id}>
                      <TableCell>{stat.bank.name}</TableCell>
                      <TableCell>{stat.averageCatch.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Statistics; 