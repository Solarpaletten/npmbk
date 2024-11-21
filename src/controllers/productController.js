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

module.exports = {
  getProducts,
};
