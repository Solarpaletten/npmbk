const pool = require("../db");

const getIncomingProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM incoming_products 
      ORDER BY created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIncomingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM incoming_products 
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Поступление не найдено" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createIncomingProduct = async (req, res) => {
  try {
    const {
      product_code,
      product_name,
      quantity,
      price_per_unit,
      total_amount,
      supplier,
      currency,
      document_date,
      invoice_number,
      operation_type,
      vat_rate,
      vat_amount,
    } = req.body;

    await pool.query("BEGIN");

    const incomingResult = await pool.query(
      `
      INSERT INTO incoming_products 
      (product_code, product_name, quantity, price_per_unit, total_amount, 
       supplier, currency, document_date, invoice_number, operation_type,
       vat_rate, vat_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        product_code,
        product_name,
        quantity,
        price_per_unit,
        total_amount,
        supplier,
        currency,
        document_date,
        invoice_number,
        operation_type,
        vat_rate,
        vat_amount,
      ]
    );

    await pool.query(
      `
      UPDATE products 
      SET quantity = quantity + $1,
          last_purchase_price = $2
      WHERE product_code = $3
    `,
      [quantity, price_per_unit, product_code]
    );

    await pool.query("COMMIT");
    res.status(201).json(incomingResult.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
};

const updateIncomingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_code,
      product_name,
      quantity,
      price_per_unit,
      total_amount,
      supplier,
      currency,
      document_date,
      invoice_number,
      operation_type,
      vat_rate,
      vat_amount,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE incoming_products 
      SET product_code = $1, product_name = $2, quantity = $3,
          price_per_unit = $4, total_amount = $5, supplier = $6,
          currency = $7, document_date = $8, invoice_number = $9,
          operation_type = $10, vat_rate = $11, vat_amount = $12
      WHERE id = $13 
      RETURNING *
    `,
      [
        product_code,
        product_name,
        quantity,
        price_per_unit,
        total_amount,
        supplier,
        currency,
        document_date,
        invoice_number,
        operation_type,
        vat_rate,
        vat_amount,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Поступление не найдено" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteIncomingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      DELETE FROM incoming_products 
      WHERE id = $1 
      RETURNING *
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Поступление не найдено" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getIncomingProducts,
  getIncomingProduct,
  createIncomingProduct,
  updateIncomingProduct,
  deleteIncomingProduct,
};
