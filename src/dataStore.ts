import pool from "./db";
import { User, Item, Order, BillingDetails, DeliveryInstructions, UserSimple } from "./types";

/**
 *     Database interaction functions for users, tokens, items, and orders.
 *******************************************************************************
 *  USER FUNCTIONS: addUser, getUser, getUserSimple, getAllUsers, updateUser,
 *                  deleteUser
 * -----------------------------------------------------------------------------
 * TOKEN FUNCTIONS: addToken, validToken, deleteToken
 * -----------------------------------------------------------------------------
 *  ITEM FUNCTIONS: addItem, getItem, deleteItem
 * -----------------------------------------------------------------------------
 * ORDER FUNCTIONS: addOrder, getOrder, getOrdersByUser, updateOrder, 
 *                  deleteOrder, addOrderXML, getLatestOrderXML,
 *                  getAllOrderXMLs, deleteOrderXMLs
 * -----------------------------------------------------------------------------
 * CLEAR FUNCTIONS: clearUsers, clearTokens, clearItems, clearOrders, clearAll
 */

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// USER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds user to DB, returns their ID
export async function addUser(user: User): Promise<number> {
    const res = await pool.query(
        `INSERT INTO Users
         (name_first, name_last, email, password, street_name, city_name,
         postal_zone, cbc_code, num_successful_logins, num_failed_passwords_since_last_login) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [user.nameFirst, user.nameLast, user.email, user.password, user.streetName,
         user.cityName, user.postalZone, user.cbcCode, user.numSuccessfulLogins,
         user.numFailedPasswordsSinceLastLogin]
    );
    return res.rows[0].id;
}

// Fetches user from DB
export async function getUser(userId: number): Promise<User | null> {
    const res = await pool.query("SELECT * FROM Users WHERE id = $1", [userId]);
    if (res.rows.length === 0) return null;

    const user = res.rows[0];
    const userResult: User = {
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
export async function getUserSimple(userId: number): Promise<UserSimple | null> {
    const res = await pool.query("SELECT * FROM Users WHERE id = $1", [userId]);
    if (res.rows.length === 0) return null;

    const user = res.rows[0];
    const userResult: UserSimple = {
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
export async function getAllUsers(): Promise<User[]> {
    const res = await pool.query("SELECT * FROM Users");
    if (res.rows.length === 0) return [];

    const userResults: User[] = [];
    for (const user of res.rows) {
        const userResult: User = {
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
export async function updateUser(user: User): Promise<boolean> {
    const res = await pool.query(
        `UPDATE Users
        SET name_first = $1, name_last = $2, email = $3, password = $4, street_name = $5,
        city_name = $6, postal_zone = $7, cbc_code = $8, num_successful_logins = $9,
        num_failed_passwords_since_last_login = $10 WHERE id = $11 RETURNING id`,
        [user.nameFirst, user.nameLast, user.email, user.password, user.streetName,
         user.cityName, user.postalZone, user.cbcCode, user.numSuccessfulLogins,
         user.numFailedPasswordsSinceLastLogin, user.id]
    );
    return (res.rows.length > 0);
}

// Deletes user from DB, returns true if successful
export async function deleteUser(userId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM Users WHERE id = $1 RETURNING *", [userId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// SESSION/TOKEN FUNCTIONS ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds token to DB, returns true if successful
export async function addToken(token: string, userId: number): Promise<boolean> {
    const res = await pool.query(
        "INSERT INTO Token (token, user_id) VALUES ($1, $2) RETURNING user", [token, userId])
    ;
    return (res.rows.length > 0);
}

// Checks whether a token exists in DB
export async function validToken(token: string): Promise<boolean> {
    const res = await pool.query("SELECT user FROM Token WHERE token = $1", [token]);
    return (res.rows.length > 0);
}

// Deletes token from DB, returns true if successful
export async function deleteToken(token: string): Promise<boolean> {
    const res = await pool.query(
        "DELETE FROM Token WHERE token = $1 RETURNING user_id", [token]
    );
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ITEM FUNCTIONS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds item to DB, returns its ID
export async function addItem(item: Item): Promise<number> {
    const res = await pool.query(
        "INSERT INTO Items (id, name, seller_id, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [item.id, item.name, item.seller.id, item.description, item.price]
    );
    return res.rows[0].id;
}

// Fetches item from DB
export async function getItem(itemId: number): Promise<Item | null> {
    const res = await pool.query("SELECT * FROM Items WHERE id = $1", [itemId]);
    if (res.rows.length === 0) return null;

    const item = res.rows[0];
    const sellerResult = await getUserSimple(item.seller_id);
    if (sellerResult === null) return null;

    const itemResult: Item = {
        id: item.id,
        name: item.name_first,
        seller: sellerResult,
        description: item.description,
        price: item.price,
    };
    return itemResult;
}

// Deletes item from DB, returns true if successful
export async function deleteItem(itemId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM Items WHERE id = $1 RETURNING id", [itemId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ORDER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds order to DB, returns its ID
export async function addOrder(order: Order): Promise<number | null> {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        const billingDetails = order.billingDetails;
        const billingRes = await client.query(
            "INSERT INTO BillingDetails (credit_card_no, cvv, expiry_date) VALUES ($1, $2, $3) RETURNING id",
            [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate]
        );

        const delivery = order.delivery;
        const deliveryRes = await client.query(
            `INSERT INTO DeliveryInstructions 
                    (street_name, city_name, postal_zone, country_subentity, address_line, cbc_code,
                     start_date, start_time, end_date, end_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [delivery.streetName, delivery.cityName, delivery.postalZone,
             delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
             delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime]
        );

        const orderRes = await client.query(
            `INSERT INTO Orders
                    (buyer_id, billing_id, delivery_id, last_edited, status, total_price, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [order.buyer.id, billingRes.rows[0].id, deliveryRes.rows[0].id,
             order.lastEdited, order.status, order.totalPrice, order.createdAt]
        );
        const orderId = orderRes.rows[0].id;

        for (const index in order.items) {
            if (order.items[index].id === null) {
                order.items[index].id = await addItem(order.items[index]);
            }

            await client.query(
                "INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3)",
                [orderId, order.items[index].id, order.quantities[index]]
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
export async function getOrder(orderId: number): Promise<Order | null> {
    const orderRes = await pool.query("SELECT * FROM Orders WHERE id = $1", [orderId]);
    if (orderRes.rows.length === 0) return null;
    const order = orderRes.rows[0];

    const itemRes = await pool.query(
        `SELECT i.id, i.name, i.seller, i.description, i.price, oi.quantity FROM OrderItems oi
         JOIN Items i ON oi.item_id = i.id WHERE oi.order_id = $1`, [orderId]
    );

    const itemResults: Item[] = [];
    const quantityResults: number[] = [];
    for (const item of itemRes.rows) {
        const sellerResult = await getUserSimple(item.seller);
        if (sellerResult === null) return null;

        const itemResult: Item = {
            id: item.id,
            name: item.name_first,
            seller: sellerResult,
            description: item.description,
            price: item.price,
        };
        
        itemResults.push(itemResult);
        quantityResults.push(item.quantity);
    }

    const buyerResult = await getUserSimple(order.user);
    if (buyerResult === null) return null;

    const billingRes = await pool.query(
        "SELECT * FROM BillingDetails WHERE id = $1", [order.billing_id]
    );
    if (billingRes.rows.length === 0) return null;
    const billingDetails = billingRes.rows[0];

    const billingResult: BillingDetails = {
        creditCardNumber: billingDetails.credit_card_no,
        CVV: billingDetails.cvv,
        expiryDate: billingDetails.expiry_date
    }

    const deliveryRes = await pool.query(
        "SELECT * FROM DeliveryInstructions WHERE id = $1", [order.delivery_id]
    );
    if (deliveryRes.rows.length === 0) return null;
    const delivery = deliveryRes.rows[0];

    const deliveryResult: DeliveryInstructions = {
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

    const orderResult: Order = {
        id: order.id,
        items: itemResults,
        quantities: quantityResults,
        buyer: buyerResult,
        billingDetails: billingResult,
        delivery: deliveryResult,
        lastEdited: order.last_edited,
        status: order.status,
        totalPrice: order.total_price,
        createdAt: order.created_at
    };
    return orderResult;
}

// Fetches all orders by a particular user from DB
export async function getOrdersByUser(userId: number): Promise<Order[]> {
    const orderRes = await pool.query("SELECT id FROM Orders WHERE buyer_id = $1", [userId]);
    const orders = orderRes.rows;
    if (orders.length === 0) return [];

    const orderResults: Order[] = [];
    for (const order of orders) {
        const orderResult = await getOrder(order.id);
        if (orderResult === null) return [];
        orderResults.push(orderResult);
    }
    return orderResults;
}

// Updates DB fields of an order, returns true if successful
export async function updateOrder(orderId: number, order: Order): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const billingDetails = order.billingDetails;
        const billingRes = await client.query(
            `UPDATE BillingDetails 
             SET credit_card_no = $1, cvv = $2, expiry_date = $3 
             WHERE id = (SELECT billing_id FROM Orders WHERE id = $4)`,
            [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate, orderId]
        );


        const delivery = order.delivery;
        await client.query(
            `UPDATE DeliveryInstructions 
             SET street_name = $1, city_name = $2, postal_zone = $3, 
                 country_subentity = $4, address_line = $5, cbc_code = $6, 
                 start_date = $7, start_time = $8, end_date = $9, end_time = $10
             WHERE id = (SELECT delivery_id FROM Orders WHERE id = $11)`,
            [delivery.streetName, delivery.cityName, delivery.postalZone,
             delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
             delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime, orderId]
        );

        await client.query(
            `UPDATE Orders 
             SET buyer_id = $1, last_edited = $2, status = $3, total_price = $4 WHERE id = $5`,
            [order.buyer.id, order.lastEdited, order.status, order.totalPrice, orderId]
        );

        await client.query("DELETE FROM OrderItems WHERE order_id = $1", [orderId]);
        for (const index in order.items) {
            await client.query(
                "INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3)",
                [orderId, order.items[index].id, order.quantities[index]]
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
export async function deleteOrder(orderId: number): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        
        const orderRes = await client.query("DELETE FROM Orders WHERE id = $1", [orderId]);

        await client.query("DELETE FROM OrderItems WHERE order_id = $1", [orderId]);

        const res = await client.query("SELECT billing_id, delivery_id FROM Orders WHERE id = $1", [orderId]);

        if (res.rows.length === 0) {
            await client.query("ROLLBACK");
            return false;
        }
        const { billingId, deliveryId } = res.rows[0];
        
        await client.query("DELETE FROM BillingDetails WHERE id = $1", [billingId]);
        await client.query("DELETE FROM DeliveryInstructions WHERE id = $1", [deliveryId]);

        await client.query("COMMIT");
        return (orderRes.rows.length > 0);
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

// Adds order XML to DB, returns true if successful
export async function addOrderXML(orderId: number, xmlContent: string): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query(
            "INSERT INTO OrderXMLs (order_id, xml_content) VALUES ($1, $2)", [orderId, xmlContent]
        );
        return true; // Insert successful
    } catch (err) {
        console.error("Error adding order XML:", err);
        return false; // Insert failed
    } finally {
        client.release();
    }
}

// Fetches latest XML of a particular order from DB
export async function getLatestOrderXML(orderId: number): Promise<string | null> {
    const client = await pool.connect();

    try {
        const res = await client.query(
            `SELECT xml_content FROM OrderXMLs WHERE order_id = $1
            ORDER BY created_at DESC LIMIT 1`, [orderId]
        );

        if (res.rows.length === 0) return null; // No XML found

        return res.rows[0].xml_content;
    } catch (err) {
        console.error("Error fetching latest order XML:", err);
        return null;
    } finally {
        client.release();
    }
}

// Fetches all XMLs of a particular order from DB, from newest to oldest
export async function getAllOrderXMLs(orderId: number): Promise<string[]> {
    const client = await pool.connect();

    try {
        const res = await client.query(
            `SELECT xml_content FROM OrderXMLs WHERE order_id = $1 ORDER BY created_at DESC`, [orderId]
        );
        return res.rows.map(row => row.xml_content);
    } catch (err) {
        console.error("Error fetching all order XMLs:", err);
        return [];
    } finally {
        client.release();
    }
}

// Deletes all XMLs of a particular order from DB, returns true if successful
export async function deleteOrderXMLs(orderId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM OrderXMLs WHERE order_id = $1 RETURNING *", [orderId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// CLEAR FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Clears all users from DB
export async function clearUsers(): Promise<boolean> {
    try {
        await pool.query("DELETE FROM Users");
        return true;
    } catch (err) {
        console.error("Error clearing all users:", err);
        return false;
    }
}

// Clears all tokens from DB
export async function clearTokens(): Promise<boolean> {
    try {
        await pool.query("DELETE FROM Tokens");
        return true;
    } catch (err) {
        console.error("Error clearing all tokens:", err);
        return false;
    }
}

// Clears all items from DB
export async function clearItems(): Promise<boolean> {
    try {
        await pool.query("DELETE FROM Items");
        return true;
    } catch (err) {
        console.error("Error clearing all items:", err);
        return false;
    }
}

// Clears all orders from DB
export async function clearOrders(): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await pool.query("DELETE FROM Orders");
        await pool.query("DELETE FROM OrderItems");
        await pool.query("DELETE FROM BillingDetails");
        await pool.query("DELETE FROM DeliveryInstructions");
        await pool.query("DELETE FROM OrderXMLs");

        await client.query("COMMIT");
        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error clearing all orders:", err);
        return false;
    }
}

// Clears everything from DB
export async function clearAll(): Promise<boolean> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await pool.query("DELETE FROM OrderItems");

        await pool.query("DELETE FROM Items");
        await pool.query("DELETE FROM OrderXMLs");
        await pool.query("DELETE FROM Orders");
        await pool.query("DELETE FROM BillingDetails");
        await pool.query("DELETE FROM DeliveryInstructions");
        await pool.query("DELETE FROM Users");
        await pool.query("DELETE FROM Tokens");
        await client.query("COMMIT");
        return true;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error clearing everything:", err);
        return false;
    }
}
