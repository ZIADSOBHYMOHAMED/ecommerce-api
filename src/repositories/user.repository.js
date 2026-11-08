const db = require("../config/db.config");

class UserRepository {
  static async createUser({
    first_name,
    last_name,
    email,
    passwordHash,
    phone,
    role = "customer",
  }) {
    const query = `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id, first_name, last_name, email,
        phone, role, is_active, created_at;
    `;

    const values = [
      first_name,
      last_name,
      email,
      passwordHash,
      phone || null,
      role,
    ];

    const { rows } = await db.query(query, values);

    return rows[0];
  }

  static async findUserByEmail(email) {
    const query = `
      SELECT
        id, first_name, last_name, email,
        password_hash, role, is_active
      FROM users
      WHERE email = $1;
    `;

    const { rows } = await db.query(query, [email]);

    return rows[0] || null;
  }

  static async findUserById(id) {
    const query = `
      SELECT
        id, first_name, last_name, email,
        phone, role, is_active, created_at
      FROM users
      WHERE id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    return rows[0] || null;
  }

  static async updateUserById(id, updatedData) {
    const allowedFields = ["first_name", "last_name", "phone"];

    const keys = Object.keys(updatedData);

    const invalidFields = keys.filter((key) => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
      throw new Error("Invalid update fields");
    }

    if (keys.length === 0) {
      return await this.findUserById(id);
    }

    const values = keys.map((key) => updatedData[key]);

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);

    values.push(id);

    const idParamIndex = values.length;

    const query = `
      UPDATE users
      SET
        ${setClauses.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idParamIndex}
      RETURNING
        id, first_name, last_name, email,
        phone, role, is_active, created_at, updated_at;
    `;

    const { rows } = await db.query(query, values);

    return rows[0] || null;
  }

  static async deleteUserById(id) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, first_name, last_name, email;
    `;

    const { rows } = await db.query(query, [id]);

    return rows[0] || null;
  }
}

module.exports = UserRepository;
