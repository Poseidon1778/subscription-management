-- 03_subscriptions.sql
-- Subscriptions and Order Lines

CREATE TYPE subscription_status AS ENUM ('draft', 'quotation', 'confirmed', 'active', 'closed');

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    subscription_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plan_id INTEGER NOT NULL REFERENCES recurring_plans(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    expiration_date DATE,
    payment_terms VARCHAR(100),
    status subscription_status NOT NULL DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_lines (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    amount NUMERIC(12,2) GENERATED ALWAYS AS (
        (quantity * unit_price) + ((quantity * unit_price) * tax_percent / 100)
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_lines_sub_id ON subscription_lines(subscription_id);
