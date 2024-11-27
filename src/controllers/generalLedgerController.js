const pool = require("../db");

// Общий регистр
const getGeneralRegister = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
        SELECT 
          id,
          document_number,
          document_date,
          document_type,
          description,
          debit_amount,
          credit_amount,
          currency,
          created_at
        FROM general_register
        WHERE created_by = $1
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Главная книга
const getGeneralLedger = async (req, res) => {
  try {
    const query = `
        SELECT 
          gl.id,
          gl.account_id,
          coa.account_code,
          coa.account_name,
          gl.transaction_date,
          gl.document_type,
          gl.debit_amount,
          gl.credit_amount,
          gl.balance,
          gl.currency
        FROM general_ledger gl
        JOIN chart_of_accounts coa ON gl.account_id = coa.id
        ORDER BY gl.transaction_date DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Взаиморасчеты по документам
const getDocSettlement = async (req, res) => {
  try {
    const query = `
        SELECT 
          id,
          document_number,
          settlement_date,
          client_id,
          amount,
          currency,
          status,
          settlement_type,
          notes
        FROM doc_settlement
        ORDER BY settlement_date DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Закрытие периода
const getPeriodClosure = async (req, res) => {
  try {
    const query = `
        SELECT 
          id,
          period_start,
          period_end,
          status,
          closed_by,
          closed_at,
          notes
        FROM period_closure
        ORDER BY period_start DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Курсы валют
const getCurrencyRates = async (req, res) => {
  try {
    const query = `
        SELECT 
          id,
          currency_from,
          currency_to,
          rate,
          valid_from,
          valid_to,
          is_active
        FROM currency_rates
        WHERE is_active = true
        ORDER BY valid_from DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// План счетов
const getChartOfAccounts = async (req, res) => {
  try {
    const query = `
        SELECT 
          id,
          account_code,
          account_name,
          account_type,
          parent_id,
          description,
          is_active,
          balance_type
        FROM chart_of_accounts
        WHERE is_active = true
        ORDER BY account_code;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGeneralRegister,
  getGeneralLedger,
  getDocSettlement,
  getPeriodClosure,
  getCurrencyRates,
  getChartOfAccounts
};