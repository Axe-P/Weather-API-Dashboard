import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    const { cityName } = req.body;
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    await HistoryService.addCity(cityName);
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error in POST /:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error in GET /history:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.status(200).json({ message: 'City deleted from history' });
  } catch (error) {
    console.error('Error in DELETE /history/:id:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
