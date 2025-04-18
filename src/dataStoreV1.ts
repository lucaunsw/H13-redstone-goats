import pool from "./db";
import { UserV1, ItemV1, OrderV1, BillingDetailsV1, 
  DeliveryInstructionsV1, UserSimpleV1, ItemSalesV1, status } from "./types";

/**
 *   Database interaction functions for users, tokens, items, and orders.
 *******************************************************************************
 *  USER FUNCTIONS: addUserV1, getUserV1, getUserSimpleV1, getAllUsersV1, 
 *                  updateUserV1, deleteUserV1
 * -----------------------------------------------------------------------------
 * TOKEN FUNCTIONS: addTokenV1, validTokenV1, deleteTokenV1
 * -----------------------------------------------------------------------------
 *  ITEM FUNCTIONS: addItemV1, getItemV1, getItemsBySellerV1,
 *                  getItemSellerSalesV1, getPopularItemsV1,
 *                  getItemBuyerRecommendationsV1, deleteItemV1
 * -----------------------------------------------------------------------------
 * ORDER FUNCTIONS: addOrderV1, getOrderV1, getOrdersByBuyerV1, updateOrderV1, 
 *                  deleteOrderV1, addOrderXMLV1, getOrderXMLV1,
 *                  getLatestOrderXMLV1, getAllOrderXMLsV1, deleteOrderXMLsV1
 */

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// USER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds user to DB, returns their ID
export async function addUserV1(user: UserV1): Promise<number> {
  user.numSuccessfulLogins = user.numSuccessfulLogins ?? 0;
  user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin ?? 0;
  const res = await pool.query(
    `INSERT INTO Users
     (name_first, name_last, email, phone, password, street_name, city_name,
      postal_zone, cbc_code, num_successful_logins, num_failed_passwords_since_last_login) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;`,
    [user.nameFirst, user.nameLast, user.email, user.phone, user.password,
     user.streetName, user.cityName, user.postalZone, user.cbcCode, 
     user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin]
  );
  return res.rows[0].id;
}

// Fetches user from DB
export async function getUserV1(userId: number): Promise<UserV1 | null> {
  
  const res = await pool.query("SELECT * FROM Users WHERE id = $1;", [userId]);
  if (res.rows.length === 0) return null;

  const user = res.rows[0];
  const userResult: UserV1 = {
    id: user.id,
    nameFirst: user.name_first,
    nameLast: user.name_last,
    email: user.email,
    password: user.password,
    streetName: user.street_name,
    cityName: user.city_name,
    postalZone: user.postal_zone,
    cbcCode: user.cbc_code,
    numSuccessfulLogins: user.num_successful_logins,
    numFailedPasswordsSinceLastLogin: user.num_failed_passwords_since_last_login
  };
  return userResult;
}

// Fetches user from DB (simple version)
export async function getUserSimpleV1(userId: number): Promise<UserSimpleV1 | null> {
  const res = await pool.query("SELECT * FROM Users WHERE id = $1;", [userId]);
  if (res.rows.length === 0) return null;

  const user = res.rows[0];
  const userResult: UserSimpleV1 = {
    id: user.id,
    name: user.name_first + " " + user.name_last,
    streetName: user.street_name,
    cityName: user.city_name,
    postalZone: user.postal_zone,
    cbcCode: user.cbc_code
  };
  return userResult;
}

// Fetches all users from DB
export async function getAllUsersV1(): Promise<UserV1[]> {
  const res = await pool.query("SELECT * FROM Users;");
  if (res.rows.length === 0) return [];

  const userResults: UserV1[] = [];
  for (const user of res.rows) {
    const userResult: UserV1 = {
      id: user.id,
      nameFirst: user.name_first,
      nameLast: user.name_last,
      email: user.email,
      password: user.password,
      streetName: user.street_name,
      cityName: user.city_name,
      postalZone: user.postal_zone,
      cbcCode: user.cbc_code,
      numSuccessfulLogins: user.num_successful_logins,
      numFailedPasswordsSinceLastLogin: user.num_failed_passwords_since_last_login
    };
    
    userResults.push(userResult);
  }
  return userResults;
}

// Updates DB fields of a user, returns true if successful
export async function updateUserV1(user: UserV1): Promise<boolean> {
  if (user.id === null) return false;
  const res = await pool.query(
    `UPDATE Users
     SET name_first = $1, name_last = $2, email = $3, phone = $4, password = $5,
         street_name = $6, city_name = $7, postal_zone = $8, cbc_code = $9, 
         num_successful_logins = $10, num_failed_passwords_since_last_login = $11 WHERE id = $12;`,
    [user.nameFirst, user.nameLast, user.email, user.phone, user.password,
     user.streetName, user.cityName, user.postalZone, user.cbcCode,
     user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin, user.id]
  );
  return (res.rowCount !== 0);
}

// Deletes user from DB, returns true if successful
export async function deleteUserV1(userId: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM Users WHERE id = $1 RETURNING *;", [userId]);
  return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// SESSION/TOKEN FUNCTIONS ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds token to DB, returns true if successful
export async function addTokenV1(token: string, userId: number): Promise<boolean> {
  const res = await pool.query(
    "INSERT INTO Tokens (jwt_token, user_id) VALUES ($1, $2) RETURNING user;", [token, userId])
  ;
  return (res.rows.length > 0);
}

// Checks whether a token exists in DB
export async function validTokenV1(token: string): Promise<boolean> {
  const res = await pool.query("SELECT user FROM Tokens WHERE jwt_token = $1;", [token]);
  return (res.rows.length > 0);
}

// Deletes token from DB, returns true if successful
export async function deleteTokenV1(token: string): Promise<boolean> {
  const res = await pool.query(
    "DELETE FROM Tokens WHERE jwt_token = $1 RETURNING user_id;", [token]
  );
  return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ITEM FUNCTIONS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds item to DB, returns its ID
export async function addItemV1(item: ItemV1): Promise<number | null> {
  const res = await pool.query(
    "INSERT INTO Items (id, name, seller_id, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING id;",
    [item.id, item.name, item.seller.id, item.description, item.price]
  );
  return (res.rows.length > 0) ? res.rows[0].id : null;
}

// Fetches item from DB
export async function getItemV1(itemId: number): Promise<ItemV1 | null> {
  const res = await pool.query("SELECT * FROM Items WHERE id = $1;", [itemId]);
  if (res.rows.length === 0) return null;

  const item = res.rows[0];
  const sellerResult = await getUserSimpleV1(item.seller_id);
  if (sellerResult === null) return null;

  const itemResult: ItemV1 = {
    id: item.id,
    name: item.name,
    seller: sellerResult,
    description: item.description,
    price: Number(item.price),
  };
  return itemResult;
}

// Fetches all items sold by a particular user from DB
export async function getItemsBySellerV1(sellerId: number): Promise<ItemV1[]> {
  const itemRes = await pool.query("SELECT id FROM Items WHERE seller_id = $1;", [sellerId]);
  const items = itemRes.rows;
  if (items.length === 0) return [];
  
  const itemResults: ItemV1[] = [];
  for (const item of items) {
    const itemResult = await getItemV1(item.id);
    if (itemResult === null) return [];
    itemResults.push(itemResult);
  }
  return itemResults;
}

// Fetches total amount sold for all items sold by a particular user from DB
export async function getItemSellerSalesV1(sellerId: number): Promise<ItemSalesV1[]> {
  const itemRes = await pool.query(
    `SELECT i.id, i.name, i.description, i.price, COALESCE(SUM(oi.quantity), 0) AS amount_sold
     FROM Items i LEFT JOIN OrderItems oi ON oi.item_id = i.id
     WHERE i.seller_id = $1 GROUP BY i.id, i.name, i.description, i.price;`, [sellerId]
  );
  const items = itemRes.rows;
  if (items.length === 0) return [];

  const itemResults: ItemSalesV1[] = [];
  for (const item of items) {
    const itemResult: ItemSalesV1 = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      amountSold: Number(item.amount_sold)
    };

    itemResults.push(itemResult);
  }
  return itemResults;
}

// Finds the top <limit> most purchased items
export async function getPopularItemsV1(limit: number): Promise<ItemV1[]> {
  const itemRes = await pool.query(
    `SELECT item_id FROM OrderItems
     GROUP BY item_id ORDER BY SUM(quantity) DESC LIMIT $1;`, [limit]
  );

  const itemResults: ItemV1[] = [];
  for (const item of itemRes.rows) {
    const itemResult = await getItemV1(item.item_id);
    if (itemResult != null) itemResults.push(itemResult);
  };
  return itemResults;
}

// Finds up to <limit> recommended items for a user to buy, each from a different seller
export async function getItemBuyerRecommendationsV1(userId: number, limit: number): Promise<ItemV1[]> {
  const sellerRes = await pool.query(
    `SELECT i.seller_id FROM OrderItems oi    LEFT JOIN Items i ON oi.item_id = i.id
     LEFT JOIN Orders o ON oi.order_id = o.id WHERE o.buyer_id = $1
     GROUP BY seller_id ORDER BY SUM(quantity) DESC LIMIT $2;`, [userId, limit]
  );
  const topSellers = sellerRes.rows.map(row => row.seller_id);
  if (topSellers.length === 0) return [];

  const wordsRes = await pool.query(
    `SELECT DISTINCT UNNEST(STRING_TO_ARRAY(LOWER(i.name), ' ')) AS keyword
    FROM OrderItems oi      LEFT JOIN Items i ON oi.item_id = i.id 
    LEFT JOIN Orders o ON oi.order_id = o.id  WHERE o.buyer_id = $1;`, [userId]
  );
  const keywords = wordsRes.rows.map(row => row.keyword);
  if (keywords.length === 0) return [];

  const itemResults: ItemV1[] = [];
  for (const sellerId of topSellers) {
    const itemRes = await pool.query(
      `SELECT i.id, i.name, COALESCE(SUM(oi.quantity), 0) AS popularity
       FROM Items i LEFT JOIN OrderItems oi ON oi.item_id = i.id
       WHERE i.seller_id = $1 AND i.name ILIKE ANY($2::text[]) 
       GROUP BY i.id, i.name  ORDER BY popularity  DESC  LIMIT 1;`, 
      [sellerId, keywords.map(k => `%${k}%`)]
    );
    if (itemRes.rows.length === 0) continue;

    const itemResult = await getItemV1(itemRes.rows[0].id);
    if (itemResult != null) itemResults.push(itemResult);
  }

  return itemResults;
}

// Deletes item from DB, returns true if successful
export async function deleteItemV1(itemId: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM Items WHERE id = $1 RETURNING id;", [itemId]);
  return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ORDER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds order to DB, returns its ID
export async function addOrderV1(order: OrderV1): Promise<number | null> {
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
          (buyer_id, billing_id, delivery_id, last_edited, 
           status, total_price, tax_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;`,
      [order.buyer.id, billingRes.rows[0].id, deliveryRes.rows[0].id, order.lastEdited,
       order.status, order.totalPrice, order.taxAmount, order.createdAt]
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
export async function getOrderV1(orderId: number): Promise<OrderV1 | null> {
  const orderRes = await pool.query("SELECT * FROM Orders WHERE id = $1;", [orderId]);
  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];

  const itemRes = await pool.query(
    `SELECT i.id, i.name, i.seller_id, i.description, i.price, oi.quantity FROM OrderItems oi
     JOIN Items i ON oi.item_id = i.id WHERE oi.order_id = $1;`, [orderId]
  );

  const itemResults: ItemV1[] = [];
  const quantityResults: number[] = [];
  for (const item of itemRes.rows) {
    const sellerResult = await getUserSimpleV1(item.seller_id);
    if (sellerResult === null) return null;

    const itemResult: ItemV1 = {
      id: item.id,
      name: item.name,
      seller: sellerResult,
      description: item.description,
      price: Number(item.price),
    };
    
    itemResults.push(itemResult);
    quantityResults.push(item.quantity);
  }

  const buyerResult = await getUserSimpleV1(order.buyer_id);
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

  const orderResult: OrderV1 = {
    id: order.id,
    items: itemResults,
    quantities: quantityResults,
    buyer: buyerResult,
    billingDetails: billingResult,
    delivery: deliveryResult,
    lastEdited: order.last_edited,
    status: order.status,
    totalPrice: Number(order.total_price),
    createdAt: order.created_at
  };
  if (order.tax_amount != null) orderResult.taxAmount = Number(order.tax_amount);
  if (order.order_xml_id != null) orderResult.orderXMLId = order.order_xml_id;
  return orderResult;
}

// Fetches all orders bought by a particular user from DB
export async function getOrdersByBuyerV1(buyerId: number): Promise<OrderV1[]> {
  const orderRes = await pool.query("SELECT id FROM Orders WHERE buyer_id = $1;", [buyerId]);
  const orders = orderRes.rows;
  if (orders.length === 0) return [];

  const orderResults: OrderV1[] = [];
  for (const order of orders) {
    const orderResult = await getOrderV1(order.id);
    if (orderResult === null) return [];
    orderResults.push(orderResult);
  }
  return orderResults;
}

// Updates DB fields of an order, returns true if successful
export async function updateOrderV1(order: OrderV1): Promise<boolean> {
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
       SET buyer_id = $1, last_edited = $2, status = $3, 
           total_price = $4, tax_amount = $5 WHERE id = $6;`,
      [order.buyer.id, order.lastEdited, order.status,
       order.totalPrice, order.taxAmount, order.id]
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

// Deletes order from DB, returns true if succesful
export async function deleteOrderV1(orderId: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const idsRes = await client.query(
      "SELECT billing_id, delivery_id FROM Orders WHERE id = $1;", [orderId]
    );
    if (idsRes.rows.length === 0) throw new Error("Order processing failed");
    const { billingId, deliveryId } = idsRes.rows[0];

    await client.query("DELETE FROM OrderItems WHERE order_id = $1;", [orderId]);
    await client.query("DELETE FROM Orders WHERE id = $1;", [orderId]);
    await client.query("DELETE FROM BillingDetails WHERE id = $1;", [billingId]);
    await client.query("DELETE FROM DeliveryInstructions WHERE id = $1;", [deliveryId]);

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting order:", err);
    return false;
  } finally {
    client.release();
  }
}

////////////////////////////////////////////////////////////////////////////////
///////////////////////////// ORDER XML FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds order XML to DB, returns its id
export async function addOrderXMLV1(orderId: number, xmlContent: string): Promise<number> {
  const res = await pool.query(
    "INSERT INTO OrderXMLs (order_id, xml_content) VALUES ($1, $2) returning id;", [orderId, xmlContent]
  );
  const orderXMLId = res.rows[0].id

  await pool.query("UPDATE Orders SET order_xml_id = $1 WHERE id = $2;", [orderXMLId, orderId]);
  return orderXMLId;
}

// Fetches order XML from DB
export async function getOrderXMLV1(orderXMLId: number): Promise<string | null> {
  const res = await pool.query("SELECT xml_content FROM OrderXMLs WHERE id = $1;", [orderXMLId]);
  return (res.rows.length > 0) ? res.rows[0].xml_content : null;
}

// Fetches latest XML of a particular order from DB
export async function getLatestOrderXMLV1(orderId: number): Promise<string | null> {
  const res = await pool.query(
    "SELECT xml_content FROM OrderXMLs WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1;", [orderId]
  );
  return (res.rows.length > 0) ? res.rows[0].xml_content : null;
}

// Fetches all XMLs of a particular order from DB, from newest to oldest
export async function getAllOrderXMLsV1(orderId: number): Promise<string[]> {
  const res = await pool.query(
    `SELECT xml_content FROM OrderXMLs WHERE order_id = $1 ORDER BY created_at DESC;`, [orderId]
  );
  return (res.rows.length > 0) ? res.rows.map(row => row.xml_content) : [];
}

// Deletes all XMLs of a particular order from DB, returns true if successful
export async function deleteOrderXMLsV1(orderId: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM OrderXMLs WHERE order_id = $1 RETURNING *;", [orderId]);
  return (res.rows.length > 0);
}
