-- 07_discounts_taxes.sql
-- Discounts and Taxes

CREATE TYPE discount_type AS ENUM ('fixed', 'percentage');

CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    discount_name VARCHAR(150) NOT NULL,
    discount_type discount_type NOT NULL,
    value NUMERIC(12,2) NOT NULL,
    minimum_purchase NUMERIC(12,2) DEFAULT 0,
    minimum_quantity INTEGER DEFAULT 1,
    start_date DATE,
    end_date DATE,
    limit_usage INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Discounts can apply to specific products and/or specific subscriptions
CREATE TABLE IF NOT EXISTS discount_products (
    id SERIAL PRIMARY KEY,
    discount_id INTEGER NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (discount_id, product_id)
);

CREATE TABLE IF NOT EXISTS discount_subscriptions (
    id SERIAL PRIMARY KEY,
    discount_id INTEGER NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    UNIQUE (discount_id, subscription_id)
);

CREATE TABLE IF NOT EXISTS taxes (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    tax_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
    tax_percent NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_products_discount ON discount_products(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_subs_discount ON discount_subscriptions(discount_id);
