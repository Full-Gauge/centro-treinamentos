-- Migration number: 0005  2026-09-30

ALTER TABLE payment_orders ADD COLUMN registration_payload TEXT;
