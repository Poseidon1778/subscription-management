-- 04_quotation_templates.sql
-- Quotation Templates and their Product Lines

CREATE TABLE IF NOT EXISTS quotation_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(150) NOT NULL,
    validity_days INTEGER NOT NULL DEFAULT 30,
    recurring_plan_id INTEGER REFERENCES recurring_plans(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_template_lines (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES quotation_templates(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_lines_template_id ON quotation_template_lines(template_id);
