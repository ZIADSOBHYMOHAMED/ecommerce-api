const db = require("../config/db.config");

class OrderRepository {
  static async createOrder({ userId, addressId, status }) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Added: Lock cart and product rows and use current database prices throughout this order transaction.
      const cartResult = await client.query(
        `
          SELECT ci.id, ci.product_id, ci.quantity, p.price
          FROM cart_items ci
          INNER JOIN carts c ON ci.cart_id = c.id
          INNER JOIN products p ON ci.product_id = p.id
          WHERE c.user_id = $1
          ORDER BY ci.id
          FOR UPDATE OF ci, p;
        `,
        [userId],
      );
      const items = cartResult.rows;

      // Added: Stop cleanly if another checkout has already consumed these cart lines.
      if (items.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      // Added: Calculate the authoritative order amount from PostgreSQL NUMERIC prices in cents.
      const totalCents = items.reduce(
        (total, item) => total + Math.round(Number(item.price) * 100) * item.quantity,
        0,
      );
      const totalAmount = (totalCents / 100).toFixed(2);

      const orderQuery = `
        INSERT INTO orders (user_id, address_id, total_amount, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, address_id, total_amount, status, created_at;
      `;
      const orderResult = await client.query(orderQuery, [
        userId,
        addressId,
        totalAmount,
        status,
      ]);
      const newOrder = orderResult.rows[0];

      const values = [];
      const placeholders = items
        .map((item, i) => {
          const base = i * 4;
          values.push(newOrder.id, item.product_id, item.quantity, item.price);
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
        })
        .join(",");

      // Updated: Persist the item price under the column defined by the checked-in schema.
      const itemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ${placeholders};
      `;
      await client.query(itemsQuery, values);

      // Updated: Delete the locked cart lines by their IDs; cart_items has no user_id column.
      const clearCartQuery = `
        DELETE FROM cart_items
        WHERE id = ANY($1::bigint[]);
      `;
      await client.query(clearCartQuery, [items.map((item) => item.id)]);

      await client.query("COMMIT");

      return newOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async findOrderByIdAndUserId(orderId, userId) {
    const query = `
      SELECT o.id, o.user_id, o.address_id, o.total_amount, o.status, o.created_at,
             COALESCE(json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price_at_purchase
               )
             ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id;
    `;
    const result = await db.query(query, [orderId, userId]);
    return result.rows[0] || null;
  }


  static async updateOrdersByIdAndAddressId(orderId, addressId, userId) {
    // Updated: Recheck pending status in the UPDATE to avoid races after the controller's earlier read.
    const query = `
      UPDATE orders
      SET address_id = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3 AND status = 'pending'
      RETURNING *;
    `;
    const result = await db.query(query, [addressId, orderId, userId]);
    return result.rows[0] || null;
  }

  static async deleteOrderById(orderId) {
    const query = `
      DELETE FROM orders
      WHERE id = $1;
    `;
    const result = await db.query(query, [orderId]);
    return result.rowCount > 0;
  }
  // Added: Provide the existing ID-only lookup API with an explicit return shape.
  static async findOrderById(order_id) {
    const query = `
      SELECT id, user_id, address_id, total_amount, status, created_at
      FROM orders
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [order_id]);
    return rows[0] || null;
  }
}

module.exports = OrderRepository;
