// controllers/chartOfAccountsController.js
const pool = require("../db");

const getAccounts = async (req, res) => {
  const companyAccountId = req.user.companyAccountId;

  try {
    const queryString = `
      SELECT 
        chart_of_accounts.*, 
        company_accounts.company_name
      FROM chart_of_accounts 
      JOIN company_accounts ON chart_of_accounts.company_account_id = company_accounts.id
      WHERE chart_of_accounts.company_account_id = $1
      ORDER BY chart_of_accounts.code
    `;

    const result = await pool.query(queryString, [companyAccountId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccount = async (req, res) => {
  const { id } = req.params;
  const companyAccountId = req.user.companyAccountId;

  try {
    const result = await pool.query(
      `SELECT chart_of_accounts.*, company_accounts.company_name
       FROM chart_of_accounts 
       JOIN company_accounts ON chart_of_accounts.company_account_id = company_accounts.id
       WHERE chart_of_accounts.id = $1 AND chart_of_accounts.company_account_id = $2`,
      [id, companyAccountId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAccount = async (req, res) => {
  // Получаем ID компании из пользовательской сессии
  const companyId = req.user.companyId;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  try {
    console.log('Creating account for company:', companyId);
    
    const { 
      code, 
      name, 
      account_type = null, 
      parent_id = null,
      is_reserve = false,
      is_advance = false,
      cost_center = null,
      text = null,
      is_active = true
    } = req.body;

    const query = `
      INSERT INTO chart_of_accounts 
        (code, name, account_type, parent_id, is_reserve, is_advance, 
         cost_center, text, is_active, company_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`;

    const values = [
      code, 
      name, 
      account_type, 
      parent_id,
      is_reserve,
      is_advance,
      cost_center,
      text,
      is_active,
      companyId
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  const companyAccountId = req.user.companyAccountId;

  try {
    const { 
      code, 
      name, 
      account_type,
      parent_id,
      is_reserve,
      is_advance,
      cost_center,
      text,
      is_active 
    } = req.body;

    const result = await pool.query(
      `UPDATE chart_of_accounts 
       SET code = $1, name = $2, account_type = $3, parent_id = $4,
           is_reserve = $5, is_advance = $6, cost_center = $7,
           text = $8, is_active = $9
       WHERE id = $10 AND company_account_id = $11
       RETURNING *`,
      [code, name, account_type, parent_id, is_reserve, is_advance,
       cost_center, text, is_active, id, companyAccountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const companyAccountId = req.user.companyAccountId;

  try {
    // Проверяем, есть ли дочерние счета
    const childAccounts = await pool.query(
      "SELECT id FROM chart_of_accounts WHERE parent_id = $1 AND company_account_id = $2",
      [id, companyAccountId]
    );

    if (childAccounts.rows.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete account with child accounts" 
      });
    }

    const result = await pool.query(
      "DELETE FROM chart_of_accounts WHERE id = $1 AND company_account_id = $2 RETURNING *",
      [id, companyAccountId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const copyAccount = async (req, res) => {
  const { id } = req.params;
  const companyAccountId = req.user.companyAccountId;

  try {
    const sourceAccount = await pool.query(
      "SELECT * FROM chart_of_accounts WHERE id = $1 AND company_account_id = $2",
      [id, companyAccountId]
    );

    if (sourceAccount.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    const account = sourceAccount.rows[0];

    const query = `
      INSERT INTO chart_of_accounts 
        (code, name, account_type, parent_id, is_reserve, is_advance,
         cost_center, text, is_active, company_account_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`;

    const values = [
      `${account.code}_copy`,
      `${account.name} (Copy)`,
      account.account_type,
      account.parent_id,
      account.is_reserve,
      account.is_advance,
      account.cost_center,
      account.text,
      account.is_active,
      companyAccountId
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  copyAccount,
};