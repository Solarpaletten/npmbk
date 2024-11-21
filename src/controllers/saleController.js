const pool = require("../db");

const getSales = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sales ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM sales WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Продажа не найдена" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const {
      product_code,
      quantity,
      price_per_unit,
      client,
      document_date,
      invoice_number,
      currency,
      vat_rate,
      vat_amount,
      payment_type,
      warehouse,
    } = req.body;

    await pool.query("BEGIN");

    const saleResult = await pool.query(
      `INSERT INTO sales 
       (product_code, quantity, price_per_unit, client, document_date,
        invoice_number, currency, vat_rate, vat_amount, payment_type, warehouse)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        product_code,
        quantity,
        price_per_unit,
        client,
        document_date,
        invoice_number,
        currency,
        vat_rate,
        vat_amount,
        payment_type,
        warehouse,
      ]
    );

    await pool.query(
      `UPDATE products 
       SET quantity = quantity - $1
       WHERE product_code = $2`,
      [quantity, product_code]
    );

    await pool.query("COMMIT");
    res.status(201).json(saleResult.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_code,
      quantity,
      price_per_unit,
      client,
      document_date,
      invoice_number,
      currency,
      vat_rate,
      vat_amount,
      payment_type,
      warehouse,
    } = req.body;

    const result = await pool.query(
      `UPDATE sales 
       SET product_code = $1, quantity = $2, price_per_unit = $3,
           client = $4, document_date = $5, invoice_number = $6,
           currency = $7, vat_rate = $8, vat_amount = $9,
           payment_type = $10, warehouse = $11
       WHERE id = $12 
       RETURNING *`,
      [
        product_code,
        quantity,
        price_per_unit,
        client,
        document_date,
        invoice_number,
        currency,
        vat_rate,
        vat_amount,
        payment_type,
        warehouse,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Продажа не найдена" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM sales WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Продажа не найдена" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
};
