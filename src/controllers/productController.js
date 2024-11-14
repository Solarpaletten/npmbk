const pool = require("../db");

const getProducts = async (req, res) => {
  try {
    const { search = "", sort = "name", order = "ASC" } = req.query;

    const searchQuery = `%${search}%`;
    const sortColumn = [
      "name",
      "code",
      "category",
      "unit",
      "vat_rate",
      "brand",
      "price_purchase",
      "price_sale",
      "min_quantity",
    ].includes(sort)
      ? sort
      : "name";
    const sortOrder = order === "DESC" ? "DESC" : "ASC";

    const result = await pool.query(
      `
        SELECT * FROM products
        WHERE name ILIKE $1 OR category ILIKE $1 OR unit ILIKE $1 OR brand ILIKE $1
        ORDER BY ${sortColumn} ${sortOrder}
        `,
      [searchQuery]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM warehouse WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_name, quantity, price } = req.body;
    const result = await pool.query(
      "INSERT INTO warehouse (product_name, quantity, price) VALUES ($1, $2, $3) RETURNING *",
      [product_name, quantity, price]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, quantity, price } = req.body;

    const result = await pool.query(
      "UPDATE warehouse SET product_name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *",
      [product_name, quantity, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM warehouse WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    res.json({ message: "Товар успешно удален" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addIncoming = async (req, res) => {
  try {
    const { warehouse_id, quantity, price_per_unit, supplier } = req.body;

    await pool.query("BEGIN");

    const incoming = await pool.query(
      "INSERT INTO incoming_goods (warehouse_id, quantity, price_per_unit, supplier) VALUES ($1, $2, $3, $4) RETURNING *",
      [warehouse_id, quantity, price_per_unit, supplier]
    );

    await pool.query(
      "UPDATE warehouse SET quantity = quantity + $1 WHERE id = $2",
      [quantity, warehouse_id]
    );

    await pool.query("COMMIT");
    res.json(incoming.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const { warehouse_id, quantity, price_per_unit, client_id } = req.body;

    await pool.query("BEGIN");

    const stock = await pool.query(
      "SELECT quantity FROM warehouse WHERE id = $1",
      [warehouse_id]
    );

    if (stock.rows[0].quantity < quantity) {
      throw new Error("Недостаточно товара на складе");
    }

    const sale = await pool.query(
      "INSERT INTO sales (warehouse_id, quantity, price_per_unit, client_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [warehouse_id, quantity, price_per_unit, client_id]
    );

    await pool.query(
      "UPDATE warehouse SET quantity = quantity - $1 WHERE id = $2",
      [quantity, warehouse_id]
    );

    await pool.query("COMMIT");
    res.json(sale.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

const getProductHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await pool.query(
      `SELECT 
        'incoming' as type,
        ig.incoming_date as date,
        ig.quantity,
        ig.price_per_unit,
        ig.supplier as description
      FROM incoming_goods ig
      WHERE ig.warehouse_id = $1
      UNION ALL
      SELECT 
        'sale' as type,
        s.sale_date as date,
        s.quantity,
        s.price_per_unit,
        c.name as description
      FROM sales s
      LEFT JOIN clients c ON c.id = s.client_id
      WHERE s.warehouse_id = $1
      ORDER BY date DESC`,
      [id]
    );
    res.json(history.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStock = async (req, res) => {
  try {
    const stock = await pool.query(
      "SELECT * FROM warehouse WHERE quantity > 0"
    );
    res.json(stock.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addIncoming,
  createSale,
  getProductHistory,
  getStock,
};
