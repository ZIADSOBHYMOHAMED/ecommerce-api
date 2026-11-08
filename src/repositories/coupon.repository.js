const db = require("../config/db.config");

class CouponRepository {
  static async findCouponByCode(code) {
    const query = `
    SELECT 
      id,
      code,
      discount_type,
      discount_value,
      valid_until,
      is_active,
      created_at,
      updated_at
    FROM coupons
    WHERE code =$1
    `;
    const { rows } = await db.query(query, [code]);
    return rows[0] || null;
  }
  static async createCoupon({ code, discountType, discountValue, validUntil }) {
    const query = `
    -- Updated: Use PostgreSQL's required parenthesized INSERT column list.
    INSERT INTO coupons (
    code,
    discount_type,
    discount_value,
    valid_until
    )
    VALUES ($1,$2,$3,$4)
    RETURNING 
    id,
    code,
    discount_type,
    discount_value,
    valid_until,
    is_active,
    created_at,
    updated_at
    `;
    const { rows } = await db.query(query, [
      code,
      discountType,
      discountValue,
      validUntil,
    ]);
    return rows[0] || null;
  }
  static async findCouponById(id) {
    const query = `
    SELECT 
      id,
      code,
      discount_type,
      discount_value,
      valid_until,
      is_active,
      created_at,
      updated_at
    FROM coupons
    WHERE id =$1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
  static async updateCoupon(id, updatedData) {
    const allowedFields = [
      "code",
      "discount_type",
      "discount_value",
      "valid_until",
      "is_active",
    ];

    const keys = Object.keys(updatedData);

    if (keys.length === 0) {
      return null;
    }

    for (const key of keys) {
      if (!allowedFields.includes(key)) {
        throw new Error(`Invalid coupon field: ${key}`);
      }
    }

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);

    const values = Object.values(updatedData);

    values.push(id);

    const query = `
      UPDATE coupons
      SET
        ${setClauses.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING
        id,
        code,
        discount_type,
        discount_value,
        valid_until,
        is_active,
        created_at,
        updated_at
    `;

    const { rows } = await db.query(query, values);

    return rows[0] || null;
  }
  static async deleteCouponById(id) {
    const query = `
    DELETE FROM coupons 
    WHERE id=$1
    `;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }
}
module.exports = CouponRepository;
