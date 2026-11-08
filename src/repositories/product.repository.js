const db = require("../config/db.config");

class ProductRepositery {
  static async findProductByCategoryAndTitle(category_id, title) {
    const query = `
    SELECT id,category_id,title,description,price,stock,slug
    FROM products
    WHERE category_id=$1 AND title=$2
    `;
    const { rows } = await db.query(query, [category_id, title]);
    return rows[0] || null;
  }
  static async createProduct({
    category_id,
    title,
    description,
    price,
    stock,
    slug,
  }) {
    const query = `
    INSERT INTO products (category_id, title, description, price, stock, slug) 
    VALUES ($1,$2,$3,$4,$5,$6) 
    RETURNING id, category_id, title, description, price, stock, slug ,created_at,updated_at
    `;
    const values = [category_id, title, description, price, stock, slug];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }
  static async findProductById(id) {
    const query = `
    SELECT id,category_id,title,description,price,stock,slug
    FROM products
    WHERE id=$1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
  static async updateProductById(id, updatedData) {
    const allowedFields = [
      "category_id",
      "title",
      "description",
      "price",
      "stock",
      "slug",
    ];

    const keys = Object.keys(updatedData);

    const invalidFields = keys.filter((key) => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
      throw new Error("Invalid product update fields");
    }

    if (keys.length === 0) {
      return await this.findProductById(id);
    }

    const values = keys.map((key) => updatedData[key]);

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);

    values.push(id);

    const idParamIndex = values.length;

    const query = `
      UPDATE products
      SET
        ${setClauses.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idParamIndex}
      RETURNING
        id, category_id, title, description,
        price, stock, slug, created_at, updated_at;
    `;

    const { rows } = await db.query(query, values);

    return rows[0] || null;
  }
  static async DeleteProductById(id) {
    // Updated: Return actual product columns so the delete query matches the products schema.
    const query = `
    DELETE FROM products
    WHERE id=$1
    RETURNING id, category_id, title, slug
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0]||null;
  }

  // Added: Match the controller's lower-camel-case method while preserving the existing method name.
  static async deleteProductById(id) {
    return this.DeleteProductById(id);
  }
}
module.exports = ProductRepositery;
