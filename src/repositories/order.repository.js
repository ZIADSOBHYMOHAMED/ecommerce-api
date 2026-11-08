const db = require("../config/db.config");

class OrderRepository {
  static async createOrder({ userId, addressId, totalAmount, status, items }) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

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

      const itemsQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ${placeholders};
      `;
      await client.query(itemsQuery, values);

      const clearCartQuery = `
        DELETE FROM cart_items
        WHERE user_id = $1;
      `;
      await client.query(clearCartQuery, [userId]);

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
             json_agg(
               json_build_object(
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id;
    `;
    const result = await db.query(query, [orderId, userId]);
    return result.rows[0] || null;
  }


  static async updateOrdersByIdAndAddressId(orderId, addressId, userId) {
    const query = `
      UPDATE orders
      SET address_id = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
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
  static async findOrderById(order_id){
    
  }
}

module.exports = OrderRepository;
