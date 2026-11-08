const pool = require("../config/db.config");

const createPayment = async ({ orderId, userId, paymentMethod }) => {
  const query = `
        INSERT INTO payments (
            order_id,
            payment_method,
            payment_status,
            amount
        )
        SELECT
            o.id,
            $3,
            'pending',
            o.total_amount
        FROM orders o
        WHERE o.id = $1
          AND o.user_id = $2
          AND o.status IN ('pending', 'confirmed')
        RETURNING
            id,
            order_id,
            payment_method,
            payment_status,
            transaction_id,
            amount,
            created_at,
            updated_at,
            paid_at,
            refunded_at;
    `;

  const values = [orderId, userId, paymentMethod];

  const { rows } = await pool.query(query, values);

  return rows[0] || null;
};

const getPaymentById = async (paymentId) => {
  const query = `
        SELECT
            id,
            order_id,
            payment_method,
            payment_status,
            transaction_id,
            amount,
            created_at,
            updated_at,
            paid_at,
            refunded_at
        FROM payments
        WHERE id = $1;
    `;

  const { rows } = await pool.query(query, [paymentId]);

  return rows[0] || null;
};

const getUserPaymentById = async (paymentId, userId) => {
  const query = `
        SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.amount,
            p.created_at,
            p.updated_at,
            p.paid_at,
            p.refunded_at
        FROM payments p
        INNER JOIN orders o
            ON o.id = p.order_id
        WHERE p.id = $1
          AND o.user_id = $2;
    `;

  const { rows } = await pool.query(query, [paymentId, userId]);

  return rows[0] || null;
};

const getPaymentByOrderId = async (orderId, userId = null) => {
  let query;
  let values;

  if (userId === null) {
    query = `
            SELECT
                id,
                order_id,
                payment_method,
                payment_status,
                transaction_id,
                amount,
                created_at,
                updated_at,
                paid_at,
                refunded_at
            FROM payments
            WHERE order_id = $1;
        `;

    values = [orderId];
  } else {
    query = `
            SELECT
                p.id,
                p.order_id,
                p.payment_method,
                p.payment_status,
                p.transaction_id,
                p.amount,
                p.created_at,
                p.updated_at,
                p.paid_at,
                p.refunded_at
            FROM payments p
            INNER JOIN orders o
                ON o.id = p.order_id
            WHERE p.order_id = $1
              AND o.user_id = $2;
        `;

    values = [orderId, userId];
  }

  const { rows } = await pool.query(query, values);

  return rows[0] || null;
};

const getUserPayments = async (userId) => {
  const query = `
        SELECT
            p.id,
            p.order_id,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.amount,
            p.created_at,
            p.updated_at,
            p.paid_at,
            p.refunded_at
        FROM payments p
        INNER JOIN orders o
            ON o.id = p.order_id
        WHERE o.user_id = $1
        ORDER BY p.created_at DESC;
    `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};

const updatePaymentStatus = async (paymentId, newStatus) => {
  const query = `
        UPDATE payments
        SET
            payment_status = $2,

            paid_at = CASE
                WHEN $2 = 'completed'
                    AND payment_status = 'pending'
                THEN CURRENT_TIMESTAMP
                ELSE paid_at
            END,

            refunded_at = CASE
                WHEN $2 = 'refunded'
                    AND payment_status = 'completed'
                THEN CURRENT_TIMESTAMP
                ELSE refunded_at
            END,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $1

          AND (
                (
                    payment_status = 'pending'
                    AND $2 IN ('completed', 'failed')
                )
                OR
                (
                    payment_status = 'completed'
                    AND $2 = 'refunded'
                )
              )

        RETURNING
            id,
            order_id,
            payment_method,
            payment_status,
            transaction_id,
            amount,
            created_at,
            updated_at,
            paid_at,
            refunded_at;
    `;

  const { rows } = await pool.query(query, [paymentId, newStatus]);

  return rows[0] || null;
};

const getPaymentByTransactionId = async (transactionId) => {
  const query = `
        SELECT
            id,
            order_id,
            payment_method,
            payment_status,
            transaction_id,
            amount,
            created_at,
            updated_at,
            paid_at,
            refunded_at
        FROM payments
        WHERE transaction_id = $1;
    `;

  const { rows } = await pool.query(query, [transactionId]);

  return rows[0] || null;
};

module.exports = {
  createPayment,
  getPaymentById,
  getUserPaymentById,
  getPaymentByOrderId,
  getUserPayments,
  updatePaymentStatus,
  getPaymentByTransactionId,
};
