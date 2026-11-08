
CREATE TABLE IF NOT EXISTS  addresses(
id BIGSERIAL PRIMARY KEY,
user_id BIGINT NOT NULL,
city VARCHAR(100) NOT NULL,
street VARCHAR(255) NOT NULL,
country VARCHAR(100) NOT NULL,
is_default BOOLEAN NOT NULL DEFAULT false,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Added: Support the repository's address list and owner-filtered lookup queries.
CREATE INDEX IF NOT EXISTS idx_addresses_user_id
ON addresses(user_id);
