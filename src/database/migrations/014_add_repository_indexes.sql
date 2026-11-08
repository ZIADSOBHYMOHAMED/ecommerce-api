-- Added: Support user-filtered payment/order lookups and address foreign-key updates.
CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_address_id
ON orders(address_id);

-- Added: Support product deletion checks against cart and order item foreign keys.
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
ON order_items(product_id);

-- Added: Support foreign-key lookups during coupon usage and review operations.
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id
ON coupon_usages(order_id);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id
ON coupon_usages(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id
ON reviews(product_id);
