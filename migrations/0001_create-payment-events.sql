-- Migration number: 0001  2026-09-17T19:57:25.759Z

CREATE TABLE IF NOT EXISTS payment_events (
  idempotency_key TEXT PRIMARY KEY,
  transaction_uuid TEXT NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  processed_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_transaction_uuid
  ON payment_events(transaction_uuid);
