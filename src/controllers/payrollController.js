const pool = require("../db");

const getPayrolls = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
        SELECT 
          payroll.id,
          payroll.period_start,
          payroll.period_end,
          users.email AS employee_email,
          users.username AS employee_name,
          employees.position AS employee_position,
          payroll.base_salary,
          payroll.bonus,
          payroll.overtime_hours,
          payroll.overtime_rate,
          payroll.gross_salary,
          payroll.tax_amount,
          payroll.insurance_amount,
          payroll.net_salary,
          payroll.payment_status,
          payroll.payment_date,
          payroll.currency,
          payroll.created_at,
          payroll.updated_at
        FROM payroll
        JOIN employees ON payroll.employee_id = employees.id
        JOIN users ON employees.user_id = users.id
        WHERE payroll.created_by = $1
        ORDER BY payroll.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM payroll 
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPayroll = async (req, res) => {
  const userId = req.user.userId;

  try {
    const {
      employee_id,
      period_start,
      period_end,
      base_salary,
      bonus,
      overtime_hours,
      overtime_rate,
      tax_amount,
      insurance_amount,
      payment_status,
      currency,
    } = req.body;

    const gross_salary =
      parseFloat(base_salary) +
      parseFloat(bonus || 0) +
      parseFloat(overtime_hours || 0) * parseFloat(overtime_rate || 0);

    const net_salary =
      gross_salary -
      parseFloat(tax_amount || 0) -
      parseFloat(insurance_amount || 0);

    const result = await pool.query(
      `
      INSERT INTO payroll 
      (employee_id, period_start, period_end, base_salary, bonus, 
       overtime_hours, overtime_rate, gross_salary, tax_amount, 
       insurance_amount, net_salary, payment_status, currency, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
      `,
      [
        employee_id,
        period_start,
        period_end,
        base_salary,
        bonus,
        overtime_hours,
        overtime_rate,
        gross_salary,
        tax_amount,
        insurance_amount,
        net_salary,
        payment_status,
        currency,
        userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      period_start,
      period_end,
      base_salary,
      bonus,
      overtime_hours,
      overtime_rate,
      tax_amount,
      insurance_amount,
      payment_status,
      currency,
    } = req.body;

    const gross_salary =
      parseFloat(base_salary) +
      parseFloat(bonus || 0) +
      parseFloat(overtime_hours || 0) * parseFloat(overtime_rate || 0);

    const net_salary =
      gross_salary -
      parseFloat(tax_amount || 0) -
      parseFloat(insurance_amount || 0);

    const result = await pool.query(
      `
      UPDATE payroll 
      SET employee_id = $1, period_start = $2, period_end = $3,
          base_salary = $4, bonus = $5, overtime_hours = $6,
          overtime_rate = $7, gross_salary = $8, tax_amount = $9,
          insurance_amount = $10, net_salary = $11, payment_status = $12,
          currency = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 
      RETURNING *
      `,
      [
        employee_id,
        period_start,
        period_end,
        base_salary,
        bonus,
        overtime_hours,
        overtime_rate,
        gross_salary,
        tax_amount,
        insurance_amount,
        net_salary,
        payment_status,
        currency,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      DELETE FROM payroll 
      WHERE id = $1 
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
};
