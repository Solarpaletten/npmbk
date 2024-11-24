const pool = require("../db");

const getPurchases = async (req, res) => {
  const userId = req.user.userId;

  try {
    // TODO add search/sort
    const query = `
        SELECT 
          purchases.id,
          purchases.purchase_date,
          clients.name AS client,   
          purchases.client_id,  
          warehouses.name AS warehouse, 
          purchases.warehouse_id,
          supplier.name AS supplier,
          purchases.supplier_id,        
          purchases.invoice_number,
          purchases.invoice_type,
          purchases.vat_rate,
          purchases.vat_amount,
          purchases.total_amount,
          purchases.currency,
          purchases.created_at,
          purchases.products
        FROM purchases
        JOIN clients ON purchases.client_id = clients.id         
        JOIN warehouses ON purchases.warehouse_id = warehouses.id
        JOIN clients AS supplier ON purchases.supplier_id = supplier.id 
        WHERE purchases.user_id = $1
        ORDER BY purchases.created_at DESC;
      `;

    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM purchases 
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPurchase = async (req, res) => {
  const userId = req.user.userId;

  try {
    const {
      invoice_type,
      invoice_number,
      purchase_date,
      warehouse_id,
      supplier_id,
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
      (invoice_type, invoice_number, purchase_date, warehouse_id, supplier_id, client_id, currency, total_amount, vat_amount, vat_rate, products, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
      [
        invoice_type,
        invoice_number,
        purchase_date,
        warehouse_id,
        supplier_id,
        client_id,
        currency,
        total_amount,
        vat_amount,
        vat_rate,
        JSON.stringify(products),
        userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoice_type,
      invoice_number,
      purchase_date,
      warehouse_id,
      supplier_id,
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
      SET invoice_type = $1, invoice_number = $2, purchase_date = $3,
          warehouse_id = $4, supplier_id = $5, client_id = $6,
          currency = $7, total_amount = $8, vat_amount = $9,
          vat_rate = $10, products = $11
      WHERE id = $12 
      RETURNING *
    `,
      [
        invoice_type,
        invoice_number,
        purchase_date,
        warehouse_id,
        supplier_id,
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
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      DELETE FROM purchases 
      WHERE id = $1 
      RETURNING *
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
};
