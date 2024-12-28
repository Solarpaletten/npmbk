const pool = require('../db');

const getSales = async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const query = `
        SELECT 
            sales.id,
            sales.sale_date,
            clients.name AS client,     
            sales.client_id,
            warehouses.name AS warehouse, 
            sales.warehouse_id,
            buyer.name AS buyer,        
            sales.buyer_id,
            sales.invoice_number,
            sales.invoice_type,
            sales.vat_rate,
            sales.vat_amount,
            sales.total_amount,
            sales.currency,
            sales.created_at,
            products
        FROM sales
        JOIN clients ON sales.client_id = clients.id         
        JOIN warehouses ON sales.warehouse_id = warehouses.id
        JOIN clients AS buyer ON sales.buyer_id = buyer.id 
        WHERE sales.user_id = $1
        ORDER BY sales.created_at DESC;
        `;
    
        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };
const getSale = async (req, res) => {
    const userId = req.user.userId;
    const saleId = req.params.id;
    
    try {
        const query = `
        SELECT 
            sales.id,
            sales.sale_date,
            clients.name AS client,     
            sales.client_id,
            warehouses.name AS warehouse, 
            sales.warehouse_id,
            buyer.name AS buyer,        
            sales.buyer_id,
            sales.invoice_number,
            sales.invoice_type,
            sales.vat_rate,
            sales.vat_amount,
            sales.total_amount,
            sales.currency,
            sales.created_at,
            products
        FROM sales
        JOIN clients ON sales.client_id = clients.id         
        JOIN warehouses ON sales.warehouse_id = warehouses.id
        JOIN clients AS buyer ON sales.buyer_id = buyer.id 
        WHERE sales.user_id = $1
        AND sales.id = $2;
        `;
    
        const result = await pool.query(query, [userId, saleId]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };
const createSale = async (req, res) => {
    const userId = req.user.userId;
    const { saleDate, clientId, warehouseId, buyerId, invoiceNumber, invoiceType, vatRate, vatAmount, totalAmount, currency, products } = req.body;
    
    try {
        const query = `
        INSERT INTO sales 
            (sale_date, client_id, warehouse_id, buyer_id, invoice_number, invoice_type, vat_rate, vat_amount, total_amount, currency, products, user_id) 
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
        `;
    
        const result = await pool.query(query, [saleDate, clientId, warehouseId, buyerId, invoiceNumber, invoiceType, vatRate, vatAmount, totalAmount, currency, products, userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };
const updateSale = async (req, res) => {
    const userId = req.user.userId;
    const saleId = req.params.id;
    const { saleDate, clientId, warehouseId, buyerId, invoiceNumber, invoiceType, vatRate, vatAmount, totalAmount, currency, products } = req.body;
    
    try {
        const query = `
        UPDATE sales
        SET 
            sale_date = $1,
            client_id = $2,
            warehouse_id = $3,
            buyer_id = $4,
            invoice_number = $5,
            invoice_type = $6,
            vat_rate = $7,
            vat_amount = $8,
            total_amount = $9,
            currency = $10,
            products = $11
        WHERE id = $12
        AND user_id = $13
        RETURNING *;
        `;
    
        const result = await pool.query(query, [saleDate, clientId, warehouseId, buyerId, invoiceNumber, invoiceType, vatRate, vatAmount, totalAmount, currency, products, saleId, userId]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    };
const deleteSale = async (req, res) => {
    const userId = req.user.userId;
    const saleId = req.params.id;
    
    try {
        const query = `
        DELETE FROM sales
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
        `;
    
        const result = await pool.query(query, [saleId, userId]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    }
module.exports = {
    getSales,
    getSale,
    createSale,
    updateSale,
    deleteSale,
    };