const pool = require("../db");

const getAccounts = async (req, res) => {
  try {
    const queryString = `
      SELECT * FROM chart_of_accounts 
      ORDER BY code
    `;

    const result = await pool.query(queryString);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAccount = async (req, res) => {
 const { id } = req.params;

 try {
   const result = await pool.query(
     "SELECT * FROM chart_of_accounts WHERE id = $1",
     [id]
   );
   
   if (result.rows.length === 0) {
     return res.status(404).json({ message: "Account not found" });
   }
   res.json(result.rows[0]);
 } catch (error) {
   console.error('Error getting account:', error);
   res.status(500).json({ error: error.message });
 }
};

const createAccount = async (req, res) => {
 try {
   const { 
     code, 
     name, 
     account_type = null, 
     parent_code = null,
     is_active = true
   } = req.body;

   if (!code || !name) {
     return res.status(400).json({
       message: "Code and name are required",
       received: { code, name },
     });
   }

   const query = `
     INSERT INTO chart_of_accounts 
       (code, name, account_type, parent_code, is_active) 
     VALUES 
       ($1, $2, $3, $4, $5) 
     RETURNING *`;

   const values = [code, name, account_type, parent_code, is_active];

   console.log('Creating account:', values);
   const result = await pool.query(query, values);
   console.log('Created account:', result.rows[0]);

   res.status(201).json(result.rows[0]);
 } catch (error) {
   console.error('Error creating account:', error);
   res.status(500).json({ error: error.message });
 }
};

const updateAccount = async (req, res) => {
 const { id } = req.params;

 try {
   const { 
     code, 
     name, 
     account_type,
     parent_code,
     is_active 
   } = req.body;

   const result = await pool.query(
     `UPDATE chart_of_accounts 
      SET code = $1, name = $2, account_type = $3, parent_code = $4,
          is_active = $5
      WHERE id = $6 
      RETURNING *`,
     [code, name, account_type, parent_code, is_active, id]
   );

   if (result.rows.length === 0) {
     return res.status(404).json({ message: "Account not found" });
   }
   res.json(result.rows[0]);
 } catch (error) {
   console.error('Error updating account:', error);
   res.status(500).json({ error: error.message });
 }
};

const deleteAccount = async (req, res) => {
 const { id } = req.params;

 try {
   // Проверяем наличие дочерних счетов
   const childAccounts = await pool.query(
     "SELECT id FROM chart_of_accounts WHERE parent_code = $1",
     [id]
   );

   if (childAccounts.rows.length > 0) {
     return res.status(400).json({ 
       message: "Cannot delete account with child accounts" 
     });
   }

   const result = await pool.query(
     "DELETE FROM chart_of_accounts WHERE id = $1 RETURNING *",
     [id]
   );
   
   if (result.rows.length === 0) {
     return res.status(404).json({ message: "Account not found" });
   }
   res.json({ message: "Account deleted successfully" });
 } catch (error) {
   console.error('Error deleting account:', error);
   res.status(500).json({ error: error.message });
 }
};

const copyAccount = async (req, res) => {
 const { id } = req.params;

 try {
   const sourceAccount = await pool.query(
     "SELECT * FROM chart_of_accounts WHERE id = $1",
     [id]
   );

   if (sourceAccount.rows.length === 0) {
     return res.status(404).json({ message: "Account not found" });
   }

   const account = sourceAccount.rows[0];

   const query = `
     INSERT INTO chart_of_accounts 
       (code, name, account_type, parent_code, is_active) 
     VALUES 
       ($1, $2, $3, $4, $5) 
     RETURNING *`;

   const values = [
     `${account.code}_copy`,
     `${account.name} (Copy)`,
     account.account_type,
     account.parent_code,
     account.is_active
   ];

   const result = await pool.query(query, values);
   res.status(201).json(result.rows[0]);
 } catch (error) {
   console.error('Error copying account:', error);
   res.status(500).json({ error: error.message });
 }
};

const importAccounts = async (req, res) => {
  try {
    const accounts = req.body;
    
    if (!Array.isArray(accounts)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const result = await pool.query(
      `INSERT INTO chart_of_accounts 
        (code, name, account_type, parent_code, is_active)
       SELECT 
        v.code,
        v.name,
        v.account_type,
        v.parent_code,
        COALESCE(v.is_active, true)
       FROM jsonb_to_recordset($1::jsonb) AS v(
        code VARCHAR(50),
        name VARCHAR(255),
        account_type VARCHAR(50),
        parent_code VARCHAR(50),
        is_active BOOLEAN
       )
       ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        account_type = EXCLUDED.account_type,
        parent_code = EXCLUDED.parent_code,
        is_active = EXCLUDED.is_active
       RETURNING *`,
      [JSON.stringify(accounts)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error importing accounts:', error);
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
 importAccounts,
};