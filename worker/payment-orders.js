function requireDatabase(env) {
  if (!env.PAYMENTS_DB) throw new Error("PAYMENTS_DB is not configured");
  return env.PAYMENTS_DB;
}

export async function createPaymentOrder(env, data) {
  const now = new Date().toISOString();
  return requireDatabase(env)
    .prepare(
      `INSERT INTO payment_orders
        (id, payment_reference, name, email, tax_receipt, phone, relation_type,
         person_type, class_id, desired_slots, billing_street, billing_number,
         billing_district, billing_complement, billing_city, billing_state,
         billing_country, billing_zipcode, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'link_pending', ?, ?)`
    )
    .bind(
      data.id,
      data.paymentReference,
      data.name,
      data.email,
      data.taxReceipt,
      data.phone,
      data.relationType || null,
      data.personType || null,
      data.classId || null,
      data.desiredSlots ?? null,
      data.billingAddress.street,
      data.billingAddress.number,
      data.billingAddress.district,
      data.billingAddress.complement || null,
      data.billingAddress.city,
      data.billingAddress.state,
      data.billingAddress.country,
      data.billingAddress.zipcode,
      now,
      now
    )
    .run();
}

export async function updatePaymentOrder(env, paymentReference, fields) {
  const assignments = Object.keys(fields).map((field) => `${field} = ?`);
  if (!assignments.length) return;

  const values = Object.values(fields);
  values.push(new Date().toISOString(), paymentReference, paymentReference);
  await requireDatabase(env)
    .prepare(
      `UPDATE payment_orders
       SET ${assignments.join(", ")}, updated_at = ?
       WHERE payment_reference = ? OR order_id = ?`
    )
    .bind(...values)
    .run();
}

export async function markPaymentOrderPaid(env, details) {
  const paymentReference = details.paymentLinkExternalCode || details.orderId;
  if (paymentReference) {
    const directUpdate = await updatePaymentOrder(env, paymentReference, {
      status: "paid",
      transaction_uuid: details.transactionUuid || null,
      order_id: details.orderId || null,
      paid_at: new Date().toISOString()
    });

    if (directUpdate?.meta?.changes > 0) return paymentReference;
  }

  if (!details.customerEmail) return null;

  const pendingOrder = await requireDatabase(env)
    .prepare(
      `SELECT payment_reference FROM payment_orders
       WHERE lower(email) = lower(?)
         AND status IN ('link_pending', 'pending_payment')
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(details.customerEmail)
    .first();

  if (!pendingOrder?.payment_reference) return null;

  await updatePaymentOrder(env, pendingOrder.payment_reference, {
    status: "paid",
    transaction_uuid: details.transactionUuid || null,
    order_id: details.orderId || null,
    paid_at: new Date().toISOString()
  });

  return pendingOrder.payment_reference;
}
