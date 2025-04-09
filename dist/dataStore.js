"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = addUser;
exports.getUser = getUser;
exports.getUserSimple = getUserSimple;
exports.getAllUsers = getAllUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.addToken = addToken;
exports.validToken = validToken;
exports.deleteToken = deleteToken;
exports.addItem = addItem;
exports.getItem = getItem;
exports.getItemsBySeller = getItemsBySeller;
exports.getItemSellerSales = getItemSellerSales;
exports.getPopularItems = getPopularItems;
exports.getItemBuyerRecommendations = getItemBuyerRecommendations;
exports.deleteItem = deleteItem;
exports.addOrder = addOrder;
exports.getOrder = getOrder;
exports.getOrdersByBuyer = getOrdersByBuyer;
exports.updateOrder = updateOrder;
exports.deleteOrder = deleteOrder;
exports.addOrderXML = addOrderXML;
exports.getOrderXML = getOrderXML;
exports.getLatestOrderXML = getLatestOrderXML;
exports.getAllOrderXMLs = getAllOrderXMLs;
exports.deleteOrderXMLs = deleteOrderXMLs;
const db_1 = __importDefault(require("./db"));
const types_1 = require("./types");
/**
 *   Database interaction functions for users, tokens, items, and orders.
 *******************************************************************************
 *  USER FUNCTIONS: addUser, getUser, getUserSimple, getAllUsers, updateUser,
 *          deleteUser
 * -----------------------------------------------------------------------------
 * TOKEN FUNCTIONS: addToken, validToken, deleteToken
 * -----------------------------------------------------------------------------
 *  ITEM FUNCTIONS: addItem, getItem, getItemsBySeller, getItemSellerSales,
 *          deleteItem
 * -----------------------------------------------------------------------------
 * ORDER FUNCTIONS: addOrder, getOrder, getOrdersByBuyer, updateOrder,
 *          deleteOrder, addOrderXML, getOrderXML, getLatestOrderXML,
 *          getAllOrderXMLs, deleteOrderXMLs
 * -----------------------------------------------------------------------------
 * CLEAR FUNCTIONS: clearUsers, clearTokens, clearItems, clearOrders, clearAll
 */
////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// USER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Adds user to DB, returns their ID
function addUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        user.numSuccessfulLogins = (_a = user.numSuccessfulLogins) !== null && _a !== void 0 ? _a : 0;
        user.numFailedPasswordsSinceLastLogin = (_b = user.numFailedPasswordsSinceLastLogin) !== null && _b !== void 0 ? _b : 0;
        const res = yield db_1.default.query(`INSERT INTO Users
     (name_first, name_last, email, password, street_name, city_name,
      postal_zone, cbc_code, num_successful_logins, num_failed_passwords_since_last_login) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`, [user.nameFirst, user.nameLast, user.email, user.password, user.streetName,
            user.cityName, user.postalZone, user.cbcCode, user.numSuccessfulLogins,
            user.numFailedPasswordsSinceLastLogin]);
        return res.rows[0].id;
    });
}
// Fetches user from DB
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT * FROM Users WHERE id = $1;", [userId]);
        if (res.rows.length === 0)
            return null;
        const user = res.rows[0];
        const userResult = {
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
    });
}
// Fetches user from DB (simple version)
function getUserSimple(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT * FROM Users WHERE id = $1;", [userId]);
        if (res.rows.length === 0)
            return null;
        const user = res.rows[0];
        const userResult = {
            id: user.id,
            name: user.name_first + " " + user.name_last,
            streetName: user.street_name,
            cityName: user.city_name,
            postalZone: user.postal_zone,
            cbcCode: user.cbc_code
        };
        return userResult;
    });
}
// Fetches all users from DB
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT * FROM Users;");
        if (res.rows.length === 0)
            return [];
        const userResults = [];
        for (const user of res.rows) {
            const userResult = {
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
    });
}
// Updates DB fields of a user, returns true if successful
function updateUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user.id === null)
            return false;
        const res = yield db_1.default.query(`UPDATE Users
     SET name_first = $1, name_last = $2, email = $3, password = $4, street_name = $5,
         city_name = $6, postal_zone = $7, cbc_code = $8, num_successful_logins = $9,
         num_failed_passwords_since_last_login = $10 WHERE id = $11;`, [user.nameFirst, user.nameLast, user.email, user.password, user.streetName,
            user.cityName, user.postalZone, user.cbcCode, user.numSuccessfulLogins,
            user.numFailedPasswordsSinceLastLogin, user.id]);
        return (res.rowCount !== 0);
    });
}
// Deletes user from DB, returns true if successful
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("DELETE FROM Users WHERE id = $1 RETURNING *;", [userId]);
        return (res.rows.length > 0);
    });
}
////////////////////////////////////////////////////////////////////////////////
/////////////////////////// SESSION/TOKEN FUNCTIONS ////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Adds token to DB, returns true if successful
function addToken(token, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("INSERT INTO Tokens (token, user_id) VALUES ($1, $2) RETURNING user;", [token, userId]);
        return (res.rows.length > 0);
    });
}
// Checks whether a token exists in DB
function validToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT user FROM Tokens WHERE token = $1;", [token]);
        return (res.rows.length > 0);
    });
}
// Deletes token from DB, returns true if successful
function deleteToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("DELETE FROM Tokens WHERE token = $1 RETURNING user_id;", [token]);
        return (res.rows.length > 0);
    });
}
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ITEM FUNCTIONS /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Adds item to DB, returns its ID
function addItem(item) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("INSERT INTO Items (id, name, seller_id, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING id;", [item.id, item.name, item.seller.id, item.description, item.price]);
        return (res.rows.length > 0) ? res.rows[0].id : null;
    });
}
// Fetches item from DB
function getItem(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT * FROM Items WHERE id = $1;", [itemId]);
        if (res.rows.length === 0)
            return null;
        const item = res.rows[0];
        const sellerResult = yield getUserSimple(item.seller_id);
        if (sellerResult === null)
            return null;
        const itemResult = {
            id: item.id,
            name: item.name,
            seller: sellerResult,
            description: item.description,
            price: Number(item.price),
        };
        return itemResult;
    });
}
// Fetches all items sold by a particular user from DB
function getItemsBySeller(sellerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemRes = yield db_1.default.query("SELECT id FROM Items WHERE seller_id = $1;", [sellerId]);
        const items = itemRes.rows;
        if (items.length === 0)
            return [];
        const itemResults = [];
        for (const item of items) {
            const itemResult = yield getItem(item.id);
            if (itemResult === null)
                return [];
            itemResults.push(itemResult);
        }
        return itemResults;
    });
}
// Fetches total amount sold for all items sold by a particular user from DB
function getItemSellerSales(sellerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemRes = yield db_1.default.query(`SELECT i.id, i.name, i.description, i.price, COALESCE(SUM(oi.quantity), 0) AS amount_sold
     FROM Items i LEFT JOIN OrderItems oi ON oi.item_id = i.id
     WHERE i.seller_id = $1 GROUP BY i.id, i.name, i.description, i.price;`, [sellerId]);
        const items = itemRes.rows;
        if (items.length === 0)
            return [];
        const itemResults = [];
        for (const item of items) {
            const itemResult = {
                id: item.id,
                name: item.name,
                description: item.description,
                price: Number(item.price),
                amountSold: Number(item.amount_sold)
            };
            itemResults.push(itemResult);
        }
        return itemResults;
    });
}
// Finds the top <limit> most purchased items
function getPopularItems(limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemRes = yield db_1.default.query(`SELECT item_id FROM OrderItems
     GROUP BY item_id ORDER BY SUM(quantity) DESC LIMIT $1;`, [limit]);
        const itemResults = [];
        for (const item of itemRes.rows) {
            const itemResult = yield getItem(item.item_id);
            if (itemResult != null)
                itemResults.push(itemResult);
        }
        ;
        return itemResults;
    });
}
// Finds up to <limit> recommended items for a user to buy, each from a different seller
function getItemBuyerRecommendations(userId, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const sellerRes = yield db_1.default.query(`SELECT i.seller_id FROM OrderItems oi    LEFT JOIN Items i ON oi.item_id = i.id
     LEFT JOIN Orders o ON oi.order_id = o.id WHERE buyer_id = $1
     GROUP BY seller_id ORDER BY SUM(quantity) DESC LIMIT $2;`, [userId, limit]);
        const topSellers = sellerRes.rows.map(row => row.seller_id);
        if (topSellers.length === 0)
            return [];
        const wordsRes = yield db_1.default.query(`SELECT DISTINCT UNNEST(STRING_TO_ARRAY(LOWER(i.name), ' ')) AS keyword
    FROM OrderItems oi      LEFT JOIN Items i ON oi.item_id = i.id 
    LEFT JOIN Orders o ON oi.order_id = o.id  WHERE buyer_id = $1;`, [userId]);
        const keywords = wordsRes.rows.map(row => row.keyword);
        if (keywords.length === 0)
            return [];
        const itemResults = [];
        for (const sellerId of topSellers) {
            const itemRes = yield db_1.default.query(`SELECT i.id, i.name, COALESCE(SUM(oi.quantity), 0) AS popularity
       FROM Items i LEFT JOIN OrderItems oi ON oi.item_id = i.id
       WHERE i.seller_id = $1 AND i.name ILIKE ANY($2::text[]) 
       GROUP BY i.id, i.name  ORDER BY popularity  DESC  LIMIT 1;`, [sellerId, keywords.map(k => `%${k}%`)]);
            if (itemRes.rows.length === 0)
                continue;
            const itemResult = yield getItem(itemRes.rows[0].id);
            if (itemResult != null)
                itemResults.push(itemResult);
        }
        return itemResults;
    });
}
// Deletes item from DB, returns true if successful
function deleteItem(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("DELETE FROM Items WHERE id = $1 RETURNING id;", [itemId]);
        return (res.rows.length > 0);
    });
}
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ORDER FUNCTIONS ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Adds order to DB, returns its ID
function addOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const client = yield db_1.default.connect();
        try {
            yield client.query("BEGIN");
            const billingDetails = order.billingDetails;
            const billingRes = yield client.query(`INSERT INTO BillingDetails (credit_card_no, cvv, expiry_date)
       VALUES ($1, $2, $3) RETURNING id;`, [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate]);
            const delivery = order.delivery;
            const deliveryRes = yield client.query(`INSERT INTO DeliveryInstructions 
          (street_name, city_name, postal_zone, country_subentity, address_line, cbc_code,
           start_date, start_time, end_date, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`, [delivery.streetName, delivery.cityName, delivery.postalZone,
                delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
                delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime]);
            order.status = (_a = order.status) !== null && _a !== void 0 ? _a : types_1.status.PENDING;
            order.lastEdited = (_b = order.lastEdited) !== null && _b !== void 0 ? _b : new Date().toISOString();
            const orderRes = yield client.query(`INSERT INTO Orders
          (buyer_id, billing_id, delivery_id, last_edited, status, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`, [order.buyer.id, billingRes.rows[0].id, deliveryRes.rows[0].id,
                order.lastEdited, order.status, order.totalPrice, order.createdAt]);
            const orderId = orderRes.rows[0].id;
            for (let index = 0; index < order.items.length; index++) {
                if (order.items[index].id === null) {
                    const itemId = yield addItem(order.items[index]);
                    if (itemId === null)
                        throw new Error("Failed to insert item");
                    order.items[index].id = itemId;
                }
                yield client.query("INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3);", [orderId, order.items[index].id, (_c = order.quantities[index]) !== null && _c !== void 0 ? _c : 1]);
            }
            yield client.query("COMMIT");
            return orderId;
        }
        catch (err) {
            yield client.query("ROLLBACK");
            console.error("Error adding order:", err);
            return null;
        }
        finally {
            client.release();
        }
    });
}
// Fetches order from DB
function getOrder(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderRes = yield db_1.default.query("SELECT * FROM Orders WHERE id = $1;", [orderId]);
        if (orderRes.rows.length === 0)
            return null;
        const order = orderRes.rows[0];
        const itemRes = yield db_1.default.query(`SELECT i.id, i.name, i.seller_id, i.description, i.price, oi.quantity FROM OrderItems oi
     JOIN Items i ON oi.item_id = i.id WHERE oi.order_id = $1;`, [orderId]);
        const itemResults = [];
        const quantityResults = [];
        for (const item of itemRes.rows) {
            const sellerResult = yield getUserSimple(item.seller_id);
            if (sellerResult === null)
                return null;
            const itemResult = {
                id: item.id,
                name: item.name,
                seller: sellerResult,
                description: item.description,
                price: Number(item.price),
            };
            itemResults.push(itemResult);
            quantityResults.push(item.quantity);
        }
        const buyerResult = yield getUserSimple(order.buyer_id);
        if (buyerResult === null)
            return null;
        const billingRes = yield db_1.default.query("SELECT * FROM BillingDetails WHERE id = $1;", [order.billing_id]);
        if (billingRes.rows.length === 0)
            return null;
        const billingDetails = billingRes.rows[0];
        const billingResult = {
            creditCardNumber: billingDetails.credit_card_no,
            CVV: billingDetails.cvv,
            expiryDate: billingDetails.expiry_date
        };
        const deliveryRes = yield db_1.default.query("SELECT * FROM DeliveryInstructions WHERE id = $1;", [order.delivery_id]);
        if (deliveryRes.rows.length === 0)
            return null;
        const delivery = deliveryRes.rows[0];
        const deliveryResult = {
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
        };
        const orderResult = {
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
        if (order.order_xml_id != null)
            orderResult.orderXMLId = order.order_xml_id;
        return orderResult;
    });
}
// Fetches all orders bought by a particular user from DB
function getOrdersByBuyer(buyerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderRes = yield db_1.default.query("SELECT id FROM Orders WHERE buyer_id = $1;", [buyerId]);
        const orders = orderRes.rows;
        if (orders.length === 0)
            return [];
        const orderResults = [];
        for (const order of orders) {
            const orderResult = yield getOrder(order.id);
            if (orderResult === null)
                return [];
            orderResults.push(orderResult);
        }
        return orderResults;
    });
}
// Updates DB fields of an order, returns true if successful
function updateOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (order.id === null)
            return false;
        const client = yield db_1.default.connect();
        try {
            yield client.query("BEGIN");
            const billingDetails = order.billingDetails;
            const billingRes = yield client.query(`UPDATE BillingDetails 
       SET credit_card_no = $1, cvv = $2, expiry_date = $3
       WHERE id = (SELECT billing_id FROM Orders WHERE id = $4);`, [billingDetails.creditCardNumber, billingDetails.CVV, billingDetails.expiryDate, order.id]);
            if (billingRes.rowCount === 0)
                throw new Error("Billing update failed");
            const delivery = order.delivery;
            const deliveryRes = yield client.query(`UPDATE DeliveryInstructions 
       SET street_name = $1, city_name = $2, postal_zone = $3, 
         country_subentity = $4, address_line = $5, cbc_code = $6, 
         start_date = $7, start_time = $8, end_date = $9, end_time = $10
       WHERE id = (SELECT delivery_id FROM Orders WHERE id = $11);`, [delivery.streetName, delivery.cityName, delivery.postalZone,
                delivery.countrySubentity, delivery.addressLine, delivery.cbcCode,
                delivery.startDate, delivery.startTime, delivery.endDate, delivery.endTime, order.id]);
            if (deliveryRes.rowCount === 0)
                throw new Error("Delivery update failed");
            const orderRes = yield client.query(`UPDATE Orders 
       SET buyer_id = $1, last_edited = $2, status = $3, total_price = $4 WHERE id = $5;`, [order.buyer.id, order.lastEdited, order.status, order.totalPrice, order.id]);
            if (orderRes.rowCount === 0)
                throw new Error("Overview update failed");
            yield client.query("DELETE FROM OrderItems WHERE order_id = $1", [order.id]);
            for (let index = 0; index < order.items.length; index++) {
                yield client.query("INSERT INTO OrderItems (order_id, item_id, quantity) VALUES ($1, $2, $3);", [order.id, order.items[index].id, (_a = order.quantities[index]) !== null && _a !== void 0 ? _a : 1]);
            }
            yield client.query("COMMIT");
            return true;
        }
        catch (err) {
            yield client.query("ROLLBACK");
            console.error("Error updating order:", err);
            return false;
        }
        finally {
            client.release();
        }
    });
}
// Deletes order from DB, returns true if succesful
function deleteOrder(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield db_1.default.connect();
        try {
            yield client.query("BEGIN");
            const idsRes = yield client.query("SELECT billing_id, delivery_id FROM Orders WHERE id = $1;", [orderId]);
            if (idsRes.rows.length === 0)
                throw new Error("Order processing failed");
            const { billingId, deliveryId } = idsRes.rows[0];
            yield client.query("DELETE FROM OrderItems WHERE order_id = $1;", [orderId]);
            yield client.query("DELETE FROM Orders WHERE id = $1;", [orderId]);
            yield client.query("DELETE FROM BillingDetails WHERE id = $1;", [billingId]);
            yield client.query("DELETE FROM DeliveryInstructions WHERE id = $1;", [deliveryId]);
            yield client.query("COMMIT");
            return true;
        }
        catch (err) {
            yield client.query("ROLLBACK");
            console.error("Error deleting order:", err);
            return false;
        }
        finally {
            client.release();
        }
    });
}
////////////////////////////////////////////////////////////////////////////////
///////////////////////////// ORDER XML FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Adds order XML to DB, returns its id
function addOrderXML(orderId, xmlContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("INSERT INTO OrderXMLs (order_id, xml_content) VALUES ($1, $2) returning id;", [orderId, xmlContent]);
        const orderXMLId = res.rows[0].id;
        yield db_1.default.query("UPDATE Orders SET order_xml_id = $1 WHERE id = $2;", [orderXMLId, orderId]);
        return orderXMLId;
    });
}
// Fetches order XML from DB
function getOrderXML(orderXMLId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT xml_content FROM OrderXMLs WHERE id = $1;", [orderXMLId]);
        return (res.rows.length > 0) ? res.rows[0].xml_content : null;
    });
}
// Fetches latest XML of a particular order from DB
function getLatestOrderXML(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("SELECT xml_content FROM OrderXMLs WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1;", [orderId]);
        return (res.rows.length > 0) ? res.rows[0].xml_content : null;
    });
}
// Fetches all XMLs of a particular order from DB, from newest to oldest
function getAllOrderXMLs(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query(`SELECT xml_content FROM OrderXMLs WHERE order_id = $1 ORDER BY created_at DESC;`, [orderId]);
        return (res.rows.length > 0) ? res.rows.map(row => row.xml_content) : [];
    });
}
// Deletes all XMLs of a particular order from DB, returns true if successful
function deleteOrderXMLs(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield db_1.default.query("DELETE FROM OrderXMLs WHERE order_id = $1 RETURNING *;", [orderId]);
        return (res.rows.length > 0);
    });
}
