function requireDatabase(env) {
  if (!env.PAYMENTS_DB) throw new Error("PAYMENTS_DB is not configured");
  return env.PAYMENTS_DB;
}

export async function createPaymentOrder(env, data) {
  const now = new Date().toISOString();
  await requireDatabase(env)
    .prepare(
      `INSERT INTO payment_orders
        (id, payment_reference, name, email, tax_receipt, phone, relation_type,
         person_type, class_id, desired_slots, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'link_pending', ?, ?)`
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
      now,
      now
    )
    .run();
}

export async function updatePaymentOrder(env, paymentReference, fields) {
  const assignments = Object.keys(fields).map((field) => `${field} = ?`);
  if (!assignments.length) return;

  const values = Object.values(fields);
  values.push(new Date().toISOString(), paymentReference);
  await requireDatabase(env)
    .prepare(
      `UPDATE payment_orders
       SET ${assignments.join(", ")}, updated_at = ?
       WHERE payment_reference = ?`
    )
    .bind(...values)
    .run();
}

export async function markPaymentOrderPaid(env, details) {
  const paymentReference = details.paymentLinkExternalCode || details.orderId;
  if (!paymentReference) return;

  await updatePaymentOrder(env, paymentReference, {
    status: "paid",
    transaction_uuid: details.transactionUuid || null,
    order_id: details.orderId || null,
    paid_at: new Date().toISOString()
  });
}
