const db = require("../config/db.config");

class CategoryRepository {
  static async createCategory({ category_name, slug, description }) {
    const query = `
      INSERT INTO categories (category_name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING id, category_name, slug, description, created_at;
    `;
    const values = [category_name, slug, description || null];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findCategoryByName(category_name) {
    const query = `
      SELECT id, category_name, slug, description, created_at
      FROM categories
      WHERE LOWER(category_name) = LOWER($1);
    `;
    const { rows } = await db.query(query, [category_name]);
    return rows[0] || null;
  }

  static async findCategoryById(id) {
    const query = `
      SELECT id, category_name, slug, description, created_at
      FROM categories
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  static async updateCategoryById(id, updatedData) {
    const keys = Object.keys(updatedData);
    if (keys.length === 0) return await this.findCategoryById(id);

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(updatedData);
    values.push(id);

    const idParamsIndex = values.length;
    const query = `
      UPDATE categories
      SET ${setClauses.join(", ")}
      WHERE id = $${idParamsIndex}
      RETURNING id, category_name, slug, description, created_at;
    `;
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  }

  static async deleteCategoryById(id) {
    const query = `
      DELETE FROM categories
      WHERE id = $1
      RETURNING id;
    `;
    const result = await db.query(query, [id]);
    return result.rowCount; 
  }
}

module.exports = CategoryRepository;
