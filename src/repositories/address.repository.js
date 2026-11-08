const db = require("../config/db.config");

class AddressRepository {
  static async createAddress(user_id, city, street, country) {
    const query = `
      INSERT INTO addresses (
        user_id,
        city,
        street,
        country
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        user_id,
        city,
        street,
        country,
        is_default,
        created_at,
        updated_at
    `;

    const values = [user_id, city, street, country];

    const { rows } = await db.query(query, values);

    return rows[0];
  }

  static async findAddressByIdAndUserId(id, user_id) {
    const query = `
      SELECT
        id,
        user_id,
        city,
        street,
        country,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE id = $1
        AND user_id = $2
    `;

    const { rows } = await db.query(query, [id, user_id]);

    return rows[0] || null;
  }

  static async findAddressesByUserId(user_id) {
    const query = `
      SELECT
        id,
        user_id,
        city,
        street,
        country,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;

    const { rows } = await db.query(query, [user_id]);

    return rows;
  }

  static async updateAddressByIdAndUserId(id, user_id, updatedData) {
    const allowedColumns = ["city", "street", "country"];

    const keys = Object.keys(updatedData);

    const invalidKeys = keys.filter((key) => !allowedColumns.includes(key));

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid address update fields: ${invalidKeys.join(", ")}`,
      );
    }

    if (keys.length === 0) {
      return this.findAddressByIdAndUserId(id, user_id);
    }

    const values = keys.map((key) => updatedData[key]);

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);

    values.push(id, user_id);

    const idParamIndex = values.length - 1;
    const userIdParamIndex = values.length;

    const query = `
      UPDATE addresses
      SET
        ${setClauses.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idParamIndex}
        AND user_id = $${userIdParamIndex}
      RETURNING
        id,
        user_id,
        city,
        street,
        country,
        is_default,
        created_at,
        updated_at
    `;

    const { rows } = await db.query(query, values);

    return rows[0] || null;
  }

  static async deleteAddressByIdAndUserId(id, user_id) {
    const query = `
      DELETE FROM addresses
      WHERE id = $1
        AND user_id = $2
    `;

    const { rowCount } = await db.query(query, [id, user_id]);

    return rowCount;
  }
}

module.exports = AddressRepository;
