import pool from "./db";
import { ItemV2, OrderV2, BillingDetailsV1, DeliveryInstructionsV1,
  UserSimpleV2, ItemSalesV1, status, ItemBuyerV2 } from "./types";
import { addItemV1 } from "./dataStoreV1";

/**
 *   Database interaction functions for users, tokens, items, and orders.
 *******************************************************************************
 *  USER FUNCTIONS: getUserSimpleV2
 * -----------------------------------------------------------------------------
 *  ITEM FUNCTIONS: addItemV2, getItemV2, getItemBuyersV2
 * -----------------------------------------------------------------------------
 * ORDER FUNCTIONS: addOrderV2, getOrderV2, getOrdersByBuyerV2, updateOrderV2
 *                  confirmOrderV2, cancelOrderV2
 */

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// USER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Fetches user from DB (simple version)
export async function getUserSimpleV2(userId: number): Promise<UserSimpleV2 | null> {
  const res = await pool.query("SELECT * FROM Users WHERE id = $1;", [userId]);
  if (res.rows.length === 0) return null;

  const user = res.rows[0];
  const userResult: UserSimpleV2 = {
    id: user.id,
    name: user.name_first + " " + user.name_last,
    email: user.email,
    streetName: user.street_name,
    cityName: user.city_name,
    postalZone: user.postal_zone,
    cbcCode: user.cbc_code
  };
  if (user.phone != null) userResult.phone = user.phone;
  return userResult;
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ITEM FUNCTIONS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds item to DB, returns its ID
export async function addItemV2(item: ItemV2): Promise<number | null> {
  const res = await pool.query(
    "INSERT INTO Items (id, name, seller_id, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING id;",
    [item.id, item.name, item.seller.id, item.description, item.price]
  );
  return (res.rows.length > 0) ? res.rows[0].id : null;
}

// Fetches item from DB
export async function getItemV2(itemId: number): Promise<ItemV2 | null> {
  const res = await pool.query("SELECT * FROM Items WHERE id = $1;", [itemId]);
  if (res.rows.length === 0) return null;

  const item = res.rows[0];
  const sellerResult = await getUserSimpleV2(item.seller_id);
  if (sellerResult === null) return null;

  const itemResult: ItemV2 = {
    id: item.id,
    name: item.name,
    seller: sellerResult,
    description: item.description,
    price: Number(item.price),
  };
  return itemResult;
}

// Fetches all items sold by a particular user from DB
export async function getItemBuyersV2(itemId: number): Promise<ItemBuyerV2[]> {
  const itemBuyerRes = await pool.query(
    `SELECT o.buyer_id, oi.quantity, o.status FROM OrderItems oi 
     LEFT JOIN Items i ON oi.item_id = i.id LEFT JOIN Orders o ON oi.order_id = o.id 
     WHERE i.id = $1 ORDER BY o.created_at`, [itemId]
  );
  const itemBuyers = itemBuyerRes.rows;
  if (itemBuyers.length === 0) return [];
  
  const itemBuyerResults: ItemBuyerV2[] = [];
  for (const itemBuyer of itemBuyers) {
    const buyerResult = await getUserSimpleV2(itemBuyer.buyer_id);
    if (buyerResult === null) return [];

    const itemBuyerResult: ItemBuyerV2 = {
      buyer: buyerResult,
      quantity: Number(itemBuyer.quantity),
      status: itemBuyer.status
    };
    itemBuyerResults.push(itemBuyerResult);
  }
  return itemBuyerResults;
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ORDER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds order to DB, returns its ID
export async function addOrderV2(order: OrderV2): Promise<number | null> {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const billingDetails = order.billingDetails;
    const billingRes = await client.query(
      `INSERT INTO BillingDetails (credit_card_no, cvv, expiry_date)
       VALUES ($1, $2, $3) RETURNING id;`,
      [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate]
    );

    const delivery = order.delivery;
    const deliveryRes = await client.query(
      `INSERT INTO DeliveryInstructions 
          (street_name, city_name, postal_zone, country_subentity, address_line, cbc_code,
           start_date, start_time, end_date, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`,
      [delivery.streetName, delivery.cityName, delivery.postalZone,
       delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
       delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime]
    );

    
    order.status = order.status ?? status.PENDING;
    order.lastEdited = order.lastEdited ?? new Date().toISOString();
    const orderRes = await client.query(
      `INSERT INTO Orders
          (buyer_id, billing_id, delivery_id, last_edited, status, total_price,
           tax_amount, tax_total, currency, payment_account_id, payment_account_name,
           financial_institution_branch_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id;`,
      [order.buyer.id, billingRes.rows[0].id, deliveryRes.rows[0].id, order.lastEdited,
       order.status, order.totalPrice, order.taxAmount, order.taxTotal, order.currency,
       order.paymentAccountId, order.paymentAccountName, order.financialInstitutionBranchId,
       order.createdAt]
    );
    const orderId = orderRes.rows[0].id;

    for (let index = 0; index < order.items.length; index++) {
      if (order.items[index].id === null) {
        const itemId = await addItemV1(order.items[index]);
        if (itemId === null) throw new Error("Failed to insert item");
        order.items[index].id = itemId;
      }

      await client.query(
        "INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3);",
        [orderId, order.items[index].id, order.quantities[index] ?? 1]
      );
    }

    await client.query("COMMIT");
    return orderId;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding order:", err);
    return null;
  } finally {
    client.release();
  }
}

// Fetches order from DB
export async function getOrderV2(orderId: number): Promise<OrderV2 | null> {
  const orderRes = await pool.query("SELECT * FROM Orders WHERE id = $1;", [orderId]);
  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];

  const itemRes = await pool.query(
    `SELECT i.id, i.name, i.seller_id, i.description, i.price, oi.quantity FROM OrderItems oi
     JOIN Items i ON oi.item_id = i.id WHERE oi.order_id = $1;`, [orderId]
  );

  const itemResults: ItemV2[] = [];
  const quantityResults: number[] = [];
  for (const item of itemRes.rows) {
    const sellerResult = await getUserSimpleV2(item.seller_id);
    if (sellerResult === null) return null;

    const itemResult: ItemV2 = {
      id: item.id,
      name: item.name,
      seller: sellerResult,
      description: item.description,
      price: Number(item.price),
    };
    
    itemResults.push(itemResult);
    quantityResults.push(item.quantity);
  }

  const buyerResult = await getUserSimpleV2(order.buyer_id);
  if (buyerResult === null) return null;

  const billingRes = await pool.query(
    "SELECT * FROM BillingDetails WHERE id = $1;", [order.billing_id]
  );
  if (billingRes.rows.length === 0) return null;
  const billingDetails = billingRes.rows[0];

  const billingResult: BillingDetailsV1 = {
    creditCardNumber: billingDetails.credit_card_no,
    CVV: billingDetails.cvv,
    expiryDate: billingDetails.expiry_date
  }

  const deliveryRes = await pool.query(
    "SELECT * FROM DeliveryInstructions WHERE id = $1;", [order.delivery_id]
  );
  if (deliveryRes.rows.length === 0) return null;
  const delivery = deliveryRes.rows[0];

  const deliveryResult: DeliveryInstructionsV1 = {
    streetName: delivery.street_name,
    cityName: delivery.city_name,
    postalZone: delivery.postal_zone,
    countrySubentity: delivery.country_subentity,
    addressLine: delivery.address_line,
    cbcCode: delivery.cbc_code,
    startDate: delivery.start_date,
    startTime: delivery.start_time,
    endDate: delivery.end_date,
    endTime: delivery.end_time
  }

  const orderResult: OrderV2 = {
    id: order.id,
    items: itemResults,
    quantities: quantityResults,
    buyer: buyerResult,
    billingDetails: billingResult,
    delivery: deliveryResult,
    lastEdited: order.last_edited,
    status: order.status,
    totalPrice: Number(order.total_price),
    currency: order.currency,
    paymentAccountId: order.payment_account_id,
    paymentAccountName: order.payment_account_name,
    financialInstitutionBranchId: order.financial_institution_branch_id,
    createdAt: order.created_at
  };
  if (order.tax_amount != null) orderResult.taxAmount = Number(order.tax_amount);
  if (order.tax_total != null) orderResult.taxTotal = Number(order.tax_total);
  if (order.order_xml_id != null) orderResult.orderXMLId = order.order_xml_id;
  return orderResult;
}

// Fetches all orders bought by a particular user from DB
export async function getOrdersByBuyerV2(buyerId: number): Promise<OrderV2[]> {
  const orderRes = await pool.query("SELECT id FROM Orders WHERE buyer_id = $1;", [buyerId]);
  const orders = orderRes.rows;
  if (orders.length === 0) return [];

  const orderResults: OrderV2[] = [];
  for (const order of orders) {
    const orderResult = await getOrderV2(order.id);
    if (orderResult === null) return [];
    orderResults.push(orderResult);
  }
  return orderResults;
}

// Updates DB fields of an order, returns true if successful
export async function updateOrderV2(order: OrderV2): Promise<boolean> {
  if (order.id === null) return false;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const billingDetails = order.billingDetails;
    const billingRes = await client.query(
      `UPDATE BillingDetails
       SET credit_card_no = $1, cvv = $2, expiry_date = $3
       WHERE id = (SELECT billing_id FROM Orders WHERE id = $4);`,
      [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate, order.id]
    );
    if (billingRes.rowCount === 0) throw new Error("Billing update failed");


    const delivery = order.delivery;
    const deliveryRes = await client.query(
      `UPDATE DeliveryInstructions 
       SET street_name = $1, city_name = $2, postal_zone = $3, 
           country_subentity = $4, address_line = $5, cbc_code = $6, 
           start_date = $7, start_time = $8, end_date = $9, end_time = $10
       WHERE id = (SELECT delivery_id FROM Orders WHERE id = $11);`,
      [delivery.streetName, delivery.cityName, delivery.postalZone,
       delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
       delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime, order.id]
    );
    if (deliveryRes.rowCount === 0) throw new Error("Delivery update failed");

    const orderRes = await client.query(
      `UPDATE Orders 
       SET buyer_id = $1, last_edited = $2, status = $3, total_price = $4, tax_amount = $5, 
       tax_total = $6, currency = $7, payment_account_id = $8, payment_account_name = $9,
       financial_institution_branch_id = $10 WHERE id = $11;`,
      [order.buyer.id, order.lastEdited, order.status, order.totalPrice, order.taxAmount,
       order.taxTotal, order.currency, order.paymentAccountId, order.paymentAccountName,
       order.financialInstitutionBranchId, order.id]
    );
    if (orderRes.rowCount === 0) throw new Error("Overview update failed");

    await client.query("DELETE FROM OrderItems WHERE order_id = $1", [order.id]);
    for (let index = 0; index < order.items.length; index++) {
      await client.query(
        "INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3);",
        [order.id, order.items[index].id, order.quantities[index] ?? 1]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating order:", err);
    return false;
  } finally {
    client.release();
  }
}

// Updates DB fields of a user, returns true if successful
export async function confirmOrderV2(orderId: number): Promise<boolean> {
  const res = await pool.query(
    "UPDATE Orders SET status = $1 WHERE id = $2;", [status.CONFIRMED, orderId]
  );
  return (res.rowCount !== 0);
}

// Updates DB fields of a user, returns true if successful
export async function cancelOrderV2(orderId: number): Promise<boolean> {
  const res = await pool.query(
    "UPDATE Orders SET status = $1 WHERE id = $2;", [status.CANCELLED, orderId]
  );
  return (res.rowCount !== 0);
}
