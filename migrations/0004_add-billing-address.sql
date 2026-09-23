-- Migration number: 0004  2026-09-23

ALTER TABLE payment_orders ADD COLUMN billing_street TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_number TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_district TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_complement TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_city TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_state TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_country TEXT;
ALTER TABLE payment_orders ADD COLUMN billing_zipcode TEXT;
