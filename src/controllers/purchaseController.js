const pool = require('../db');

const getPurchases = async (req, res) => {
  const userId = req.user.userId;

  try {
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
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPurchase = async (req, res) => {
  const userId = req.user.userId;
  const {
    purchaseDate,
    clientId,
    warehouseId,
    supplierId,
    invoiceNumber,
    invoiceType,
    vatRate,
    vatAmount,
    totalAmount,
    currency,
    products,
  } = req.body;

  try {
    const query = `
        INSERT INTO purchases 
        (purchase_date, client_id, warehouse_id, supplier_id, invoice_number, invoice_type, vat_rate, vat_amount, total_amount, currency, products, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;

    const result = await pool.query(query, [
      purchaseDate,
      clientId,
      warehouseId,
      supplierId,
      invoiceNumber,
      invoiceType,
      vatRate,
      vatAmount,
      totalAmount,
      currency,
      products,
      userId,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const {
    purchaseDate,
    clientId,
    warehouseId,
    supplierId,
    invoiceNumber,
    invoiceType,
    vatRate,
    vatAmount,
    totalAmount,
    currency,
    products,
  } = req.body;

  try {
    const query = `
        UPDATE purchases
        SET 
          purchase_date = $1,
          client_id = $2,
          warehouse_id = $3,
          supplier_id = $4,
          invoice_number = $5,
          invoice_type = $6,
          vat_rate = $7,
          vat_amount = $8,
          total_amount = $9,
          currency = $10,
          products = $11
        WHERE id = $12
        RETURNING *;
      `;

    const result = await pool.query(query, [
      purchaseDate,
      clientId,
      warehouseId,
      supplierId,
      invoiceNumber,
      invoiceType,
      vatRate,
      vatAmount,
      totalAmount,
      currency,
      products,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deletePurchase = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM purchases 
      WHERE id = $1
      RETURNING *;
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
};