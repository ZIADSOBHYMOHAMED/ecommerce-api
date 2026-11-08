
CREATE TABLE IF NOT EXISTS  orders(
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  address_id BIGINT ,
  total_amount DECIMAL(10,2) NOT NULL CHECK(total_amount>=0),
  status VARCHAR(30)DEFAULT 'pending' NOT NULL 
  CHECK(status IN ('pending','processing','shipped','delivered','cancelled','refunded')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);