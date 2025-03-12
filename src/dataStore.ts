import pool from "./db";
import { UserData, Item, Order, OrderItem } from "./types";

/*  Function List:

    USER
        - addUser(user: UserData): Promise<number>
        - getUser(userId: number): Promise<UserData | null>
        - getAllUsers(): Promise<UserData[]>
        - updateUser(user: UserData): Promise<boolean>
        - deleteUser(userId: number): Promise<boolean>

    SESSION/TOKEN
        - addSession(sessionId: number, userId: number): Promise<boolean>
        - validSession(sessionId: number): Promise<boolean>
        - deleteSession(sessionId: number): Promise<boolean>

    ITEM
        - addItem(item: Item): Promise<number>
        - getItem(itemId: number): Promise<Item | null>
        - deleteItem(itemId: number): Promise<boolean>

    ORDER
        - addOrder(order: Order, items: OrderItem[]): Promise<number | null>
        - getOrder(orderId: number): Promise<{ order: Order; items: OrderItem[] } | null>
        - getOrdersByUser(userId: number): Promise<{ order: Order; items: OrderItem[] }[]>
        - updateOrder(order: Order, items: OrderItem[]): Promise<boolean>
        - deleteOrder(orderId: number): Promise<boolean>

*/

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// USER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds user to DB, returns their ID
export async function addUser(user: UserData): Promise<number> {
    const res = await pool.query(
        "INSERT INTO Users (nameFirst, nameLast, email, currPass, numSuccessulLogins, numFailedPasswordsSinceLastLogin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING userId",
        [user.nameFirst, user.nameLast, user.email, user.password, user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin]
    );
    return res.rows[0].userid;
}

// Fetches user data from DB
export async function getUser(userId: number): Promise<UserData | null> {
    const res = await pool.query("SELECT * FROM Users WHERE userId = $1", [userId]);
    return res.rows.length > 0 ? res.rows[0] : null;
}

// Fetches all user data from DB
export async function getAllUsers(): Promise<UserData[]> {
    const res = await pool.query("SELECT * FROM Users");
    return res.rows.length > 0 ? res.rows : [];
}

// Updates DB fields of a user, returns true if successful
export async function updateUser(user: UserData): Promise<boolean> {
    const res = await pool.query(
        "UPDATE Users SET nameFirst = $1, nameLast = $2, email = $3, currPass = $4, numSuccessulLogins = $5, numFailedPasswordsSinceLastLogin = $6 WHERE userId = $7 RETURNING *",
        [user.nameFirst, user.nameLast, user.email, user.password, user.numSuccessfulLogins, user.numFailedPasswordsSinceLastLogin, user.id]
    );
    return (res.rows.length > 0);
}

// Deletes user from DB, returns true if successful
export async function deleteUser(userId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM Users WHERE userId = $1 RETURNING *", [userId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// SESSION/TOKEN FUNCTIONS ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds session token to DB, returns true if successful
export async function addSession(sessionId: number, userId: number): Promise<boolean> {
    const res = await pool.query("INSERT INTO Sessions (sessionId, userId) VALUES ($1, $2) RETURNING *", [sessionId, userId]);
    return (res.rows.length > 0);
}

// Checks whether a session token exists in DB
export async function validSession(sessionId: number): Promise<boolean> {
    const res = await pool.query("SELECT * FROM Sessions WHERE sessionId = $1", [sessionId]);
    return (res.rows.length > 0);
}

// Deletes session token from DB, returns true if successful
export async function deleteSession(sessionId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM Sessions WHERE sessionId = $1 RETURNING *", [sessionId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ITEM FUNCTIONS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds item to DB, returns its ID
export async function addItem(item: Item): Promise<number> {
    const res = await pool.query(
        "INSERT INTO Items (name, price) VALUES ($1, $2) RETURNING itemId",
        [item.name, item.price]
    );
    return res.rows[0].itemid;
}


export async function getItem(itemId: number): Promise<Item | null> {
    const res = await pool.query("SELECT * FROM Items WHERE itemId = $1", [itemId]);
    return res.rows.length > 0 ? res.rows[0] : null;
}

// Deletes session token from DB, returns true if successful
export async function deleteItem(itemId: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM Items WHERE itemId = $1 RETURNING *", [itemId]);
    return (res.rows.length > 0);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ORDER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Adds order to DB (along with order items), returns its ID
export async function addOrder(order: Order, items: OrderItem[]): Promise<number | null> {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");

        const orderRes = await client.query(
            "INSERT INTO Orders (userId, totalPrice) VALUES ($1, $2) RETURNING orderId",
            [order.userId, order.totalPrice]
        );
        const orderId = orderRes.rows[0].orderid;

        for (const item of items) {
            await client.query(
                "INSERT INTO OrderItems (orderId, itemId, quantity) VALUES ($1, $2, $3)",
                [orderId, item.itemId, item.quantity]
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

export async function getOrder(orderId: number): Promise<{ order: Order; items: OrderItem[] } | null> {
    const orderRes = await pool.query("SELECT * FROM Orders WHERE orderId = $1", [orderId]);

    if (orderRes.rows.length === 0) return null;
    const order = orderRes.rows[0];

    const itemRes = await pool.query(
        `SELECT i.itemId, i.name, i.price, oi.quantity
         FROM OrderItems oi
         JOIN Items i ON oi.itemId = i.itemId
         WHERE oi.orderId = $1`,
        [orderId]
    );

    return orderRes.rows.length > 0 ? { order, items: itemRes.rows } : null;
}

export async function getOrdersByUser(userId: number): Promise<{ order: Order; items: OrderItem[] }[]> {
    const orderRes = await pool.query("SELECT * FROM Orders WHERE userId = $1", [userId]);

    const orders = orderRes.rows;
    if (orders.length === 0) return [];

    const results: { order: Order; items: OrderItem[] }[] = [];

    for (const order of orders) {
        const itemRes = await pool.query(
            `SELECT i.itemId, i.name, i.price, oi.quantity
             FROM OrderItems oi
             JOIN Items i ON oi.itemId = i.itemId
             WHERE oi.orderId = $1`,
            [order.orderid]
        );

        results.push({ order, items: itemRes.rows });
    }

    return results;
}
  

export async function updateOrder(order: Order, items: OrderItem[]): Promise<boolean> {
    const client = await pool.connect();
    
    try {
        await client.query("BEGIN");
  
        const orderRes = await client.query(
            "UPDATE Orders SET totalPrice = $1 WHERE orderId = $2 RETURNING *",
            [order.totalPrice, order.id]
        );
        if (orderRes.rows.length === 0) return false;
  
        await client.query("DELETE FROM OrderItems WHERE orderId = $1", [order.id]);
  
        for (const item of items) {
            await client.query(
                "INSERT INTO OrderItems (orderId, itemId, quantity) VALUES ($1, $2, $3)",
                [order.id, item.itemId, item.quantity]
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

export async function deleteOrder(orderId: number): Promise<boolean> {    
    const orderRes = await pool.query("DELETE FROM Orders WHERE orderId = $1 RETURNING orderId", [orderId]);
    if (orderRes.rows.length === 0) return false;
  
    const itemRes = await pool.query("DELETE FROM OrderItems WHERE orderId = $1", [orderId]);
    return true;
}
  
