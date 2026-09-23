-- Migration number: 0003  2026-09-23

CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  payment_reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  tax_receipt TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation_type TEXT,
  person_type TEXT,
  class_id TEXT,
  desired_slots INTEGER,
  status TEXT NOT NULL,
  ipag_uuid TEXT,
  order_id TEXT,
  transaction_uuid TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  registration_submitted_at TEXT,
  paid_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_status
  ON payment_orders(status);

CREATE INDEX IF NOT EXISTS idx_payment_orders_transaction_uuid
  ON payment_orders(transaction_uuid);
