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

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
