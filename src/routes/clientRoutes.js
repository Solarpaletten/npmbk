import express from 'express';
const router = express.Router();

import { getClients, addClient } from '../models/clientModel.js';  // Изменённое имя модели

// Получение всех клиентов
router.get('/', async (req, res) => {
  try {
    const clients = await getClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Добавление нового клиента
router.post('/', async (req, res) => {
  try {
    const newClient = await addClient(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
