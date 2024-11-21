const pool = require("../db");

const getSales = async (req, res) => {
  try {
    // TODO add search/sort
    const query = `
      SELECT 
        sales.id,
        sales.sale_date,
        clients.name AS client,     
        warehouses.name AS warehouse, 
        buyer.name AS buyer,        
        sales.invoice_number,
        sales.invoice_type,
        sales.vat_rate,
        sales.vat_amount,
        sales.total_amount,
        sales.currency,
        sales.created_at
      FROM sales
      JOIN clients ON sales.client_id = clients.id         
      JOIN warehouses ON sales.warehouse_id = warehouses.id
      JOIN clients AS buyer ON sales.buyer_id = buyer.id 
      ORDER BY sales.created_at DESC;
    `;

    const result = await pool.query(query);
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
      return res.status(404).json({ error: "Sale not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const {
      invoice_type,
      invoice_number,
      sale_date,
      warehouse_id,
      buyer_id,
      client_id,
      currency,
      total_amount,
      vat_amount,
      vat_rate,
      products,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO purchases 
      (invoice_type, invoice_number, purchase_date, warehouse_id, supplier_id, client_id, currency, total_amount, vat_amount, vat_rate, products)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
      [
        invoice_type,
        invoice_number,
        sale_date,
        warehouse_id,
        buyer_id,
        client_id,
        currency,
        total_amount,
        vat_amount,
        vat_rate,
        JSON.stringify(products),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoice_type,
      invoice_number,
      sale_date,
      warehouse_id,
      buyer_id,
      client_id,
      currency,
      total_amount,
      vat_amount,
      vat_rate,
      products,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE purchases 
      SET invoice_type = $1, invoice_number = $2, sale_date = $3,
          warehouse_id = $4, buyer_id = $5, client_id = $6,
          currency = $7, total_amount = $8, vat_amount = $9,
          vat_rate = $10, products = $11
      WHERE id = $12 
      RETURNING *
      `,
      [
        invoice_type,
        invoice_number,
        sale_date,
        warehouse_id,
        buyer_id,
        client_id,
        currency,
        total_amount,
        vat_amount,
        vat_rate,
        products,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sale not found" });
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
      return res.status(404).json({ error: "Sale not found" });
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
