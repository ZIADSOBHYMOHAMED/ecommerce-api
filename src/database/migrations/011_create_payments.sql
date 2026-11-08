CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE,

    payment_method VARCHAR(50) NOT NULL DEFAULT 'card'
        CHECK (
            payment_method IN (
                'cash',
                'card',
                'stripe',
                'paypal'
            )
        ),

    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (
            payment_status IN (
                'pending',
                'completed',
                'failed',
                'refunded'
            )
        ),

    transaction_id VARCHAR(255) UNIQUE,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    paid_at TIMESTAMPTZ,

    refunded_at TIMESTAMPTZ,

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_payment_paid_at
        CHECK (
            payment_status <> 'completed'
            OR paid_at IS NOT NULL
        ),

    CONSTRAINT chk_payment_refunded_at
        CHECK (
            payment_status <> 'refunded'
            OR refunded_at IS NOT NULL
        ),

    CONSTRAINT chk_payment_refund_requires_paid
        CHECK (
            refunded_at IS NULL
            OR paid_at IS NOT NULL
        )
);