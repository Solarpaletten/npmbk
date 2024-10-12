const mongoose = require('mongoose');

// Определение схемы для транзакций
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

// Создание модели на основе схемы
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
