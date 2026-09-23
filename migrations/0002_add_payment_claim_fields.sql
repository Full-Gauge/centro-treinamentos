-- Migration number: 0002  2026-09-23

ALTER TABLE payment_events ADD COLUMN claim_token TEXT;
ALTER TABLE payment_events ADD COLUMN payment_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_reference
  ON payment_events(payment_reference);
