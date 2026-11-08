CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage','fixed') ),
    discount_value DECIMAL(10, 2) NOT NULL CHECK ((discount_type='percentage'
    AND  discount_value > 0 
    AND  discount_value <=100) 
    OR (discount_type='fixed' AND discount_value > 0 ) ),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);