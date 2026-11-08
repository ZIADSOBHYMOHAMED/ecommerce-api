const db = require("../config/db.config");

class CartRepository {
  static async findCartByUserId(user_id) {
    const query = `
      SELECT
        c.id AS cart_id,
        c.user_id,
        c.created_at,
        c.updated_at,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ci.id,
              'product_id', ci.product_id,
              'quantity', ci.quantity,
              'created_at', ci.created_at,
              'updated_at', ci.updated_at
            )
            ORDER BY ci.id
          ) FILTER (WHERE ci.id IS NOT NULL),
          '[]'
        ) AS items

      FROM carts c

      LEFT JOIN cart_items ci
        ON ci.cart_id = c.id

      WHERE c.user_id = $1

      GROUP BY
        c.id,
        c.user_id,
        c.created_at,
        c.updated_at;
    `;

    const { rows } = await db.query(query, [user_id]);

    return rows[0] || null;
  }

  static async findActiveProductById(product_id) {
    // Updated: Select only columns present in the products migration; that schema has no active flag.
    const query = `
      SELECT
        id,
        category_id,
        title,
        price
      FROM products
      WHERE id = $1;
    `;

    const { rows } = await db.query(query, [product_id]);

    return rows[0] || null;
  }

  static async findProductInCart(cart_id, product_id) {
    const query = `
      SELECT
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at
      FROM cart_items
      WHERE cart_id = $1
        AND product_id = $2;
    `;

    const { rows } = await db.query(query, [cart_id, product_id]);

    return rows[0] || null;
  }

  static async addProductToCart(cart_id, product_id, quantity) {
    const query = `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        quantity
      )
      VALUES ($1, $2, $3)

      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP

      RETURNING
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at;
    `;

    const { rows } = await db.query(query, [cart_id, product_id, quantity]);

    return rows[0] || null;
  }

  static async updateProductQuantity(cart_id, product_id, quantity) {
    const query = `
      UPDATE cart_items

      SET
        quantity = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE cart_id = $2
        AND product_id = $3

      RETURNING
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        updated_at;
    `;

    const { rows } = await db.query(query, [quantity, cart_id, product_id]);

    return rows[0] || null;
  }

  static async deleteProductFromCart(cart_id, product_id) {
    const query = `
      DELETE FROM cart_items
      WHERE cart_id = $1
        AND product_id = $2;
    `;

    const result = await db.query(query, [cart_id, product_id]);

    return result.rowCount > 0;
  }

  static async clearCartByCartId(cart_id) {
    const query = `
      DELETE FROM cart_items
      WHERE cart_id = $1;
    `;

    const result = await db.query(query, [cart_id]);

    return result.rowCount;
  }
  // Updated: Keep the order-specific cart lookup under a distinct name so it does not shadow the cart response method.
  static async findCartItemsByUserId(user_id) {
    const query = `
      SELECT
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.price
      FROM cart_items ci
      INNER JOIN carts c ON ci.cart_id = c.id
      INNER JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY ci.id;
    `;
    const { rows } = await db.query(query, [user_id]);
    return rows;
  }
}

module.exports = CartRepository;
