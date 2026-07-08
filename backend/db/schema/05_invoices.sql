-- 05_invoices.sql
-- Invoices and Invoice Lines

CREATE TYPE invoice_status AS ENUM ('draft', 'confirmed', 'paid', 'cancelled');

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status invoice_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    amount NUMERIC(12,2) GENERATED ALWAYS AS (
        (quantity * unit_price) + ((quantity * unit_price) * tax_percent / 100)
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
