import express from 'express';
const router = express.Router();

import { getClients, addClient } from '../models/clientModel.js';

// Получение всех клиентов
router.get('/', async (_, res) => {
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
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const newClient = await addClient({ name, email });
    res.status(201).json(newClient);
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error code for MongoDB
      res.status(400).json({ message: 'Client already exists' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

export default router;
