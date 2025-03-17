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
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderConfirm = exports.orderCancel = void 0;
exports.orderCreate = orderCreate;
exports.orderChange = orderChange;
const types_1 = require("./types");
const helper_1 = require("./helper");
const dataStore_1 = require("./dataStore");
/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderParam} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
function orderCreate(order) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!order.buyer.id) {
            throw new Error('No userId provided');
        }
        const user = yield (0, helper_1.userExists)(order.buyer.id, order.buyer.name);
        if (!user) {
            throw new Error('Invalid userId or a different name is registered to userId');
        }
        // Throw error for invalid bank details.
        if (order.billingDetails.creditCardNumber > 9999999999999999 ||
            order.billingDetails.creditCardNumber < 100000000000) {
            throw new Error('Invalid bank details');
        }
        // Throw error for invalid date selection.
        const currDate = new Date().toISOString().split('T')[0];
        if (order.delivery.startDate < currDate || order.delivery.endDate < currDate
            || order.delivery.startDate > order.delivery.endDate) {
            throw new Error('Invalid date selection');
        }
        // If an invalid amount of item quantities are provided, throw error.
        if (order.items.length !== order.quantities.length) {
            throw new Error('Invalid amount of item quantities provided');
        }
        // Helper function checks if all items/quantities are valid and returns the 
        // total price if so.
        const totalPrice = yield (0, helper_1.validItemList)(order);
        // Throw error if inputted total price is incorrect.
        if (totalPrice !== order.totalPrice) {
            throw new Error('Incorrect total price provided');
        }
        // Helper function adds all items to item datastore.
        yield (0, helper_1.addItems)(order);
        order.lastEdited = currDate;
        order.status = types_1.status.PENDING;
        const orderId = yield (0, dataStore_1.addOrder)(order);
        // Helper function generates UBl document.
        if (orderId !== null) {
            const UBLDocument = (0, helper_1.generateUBL)(orderId, order);
            yield (0, dataStore_1.addOrderXML)(orderId, UBLDocument);
        }
        return { orderId };
    });
}
const orderCancel = (userId, orderId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    // // Check if userId and orderId are valid
    // const user = await getUser(userId);
    // if (!user) {
    //     throw new Error("invalid userId");
    // }
    // const orderData = await getOrder(orderId);
    // if (!orderData) {
    //     throw new Error("invalid orderId");
    // }
    // const { order, items } = orderData;
    // if (order.status === status.CANCELLED) {
    //     throw new Error("order already cancelled");
    // }
    // order.status = status.CANCELLED;
    // const updateSuccess = await updateOrder(order, items);
    // if (!updateSuccess) {
    //     throw new Error("failed to update order status to cancelled");
    // }
    // return { reason };
});
exports.orderCancel = orderCancel;
/**
 * Change an existing order's items (not metadata)
 *
 * @param {number} userId - Unique identifier for each user
 * @param {number} orderId - Unique identifier for an order
 * @param {Array} items - Array containing updated item details (item Id, item quantity)
 * @returns {number} orderId - Unique identifier for an order
 */
function orderChange(userId, orderId, updatedData) {
    return __awaiter(this, void 0, void 0, function* () {
        // [ERROR CHECKING] OrderId Exists
        const order = yield (0, dataStore_1.getOrder)(orderId);
        if (!order) {
            throw new Error('Invalid orderId');
        }
        // [ERROR CHECKING] UserId Exists
        const user = yield (0, dataStore_1.getUser)(userId);
        if (!user) {
            throw new Error('Invalid userId');
        }
        // // Calculate updated price: cannot use this function as it throws an error when 
        // // an existing itemId is inputted, change this prolly?
        // const totalPrice = await validItemList({
        //   ...order,
        //   items: updatedData.items,
        //   quantities: updatedData.items.map(item => item.newQuantity)});
        const totalPrice = 200; // Placeholder value
        // Set current time for lastEdited:
        const lastEdited = new Date().toISOString();
        // MODIFY ITEMS LOCALLY - Since orderUpdate db function updates all at once. must handle insertion/deleetion
        // logic prior to db push
        // Iterate over the provided updated items
        for (const item of updatedData.items) {
            const itemIndex = order.items.findIndex(orderItem => orderItem.id === item.itemId);
            const existingItem = yield (0, dataStore_1.getItem)(item.itemId);
            if (existingItem) {
                // If item exists and quantity is > 0, update quantity
                if (item.newQuantity > 0) {
                    order.quantities[itemIndex] = item.newQuantity;
                    // If item exists and quantity is = 0, remove item
                }
                else if (item.newQuantity === 0) {
                    order.items.splice(itemIndex, 1);
                    order.quantities.splice(itemIndex, 1);
                }
                // If item does not exist, add new item to order
            }
            else {
                order.items.push({
                    id: item.itemId,
                    name: item.name,
                    seller: item.seller,
                    description: item.description,
                    price: item.price
                });
                order.quantities.push(item.newQuantity);
            }
        }
        // Create updatedOrder object to parse into db function
        const updatedOrder = Object.assign(Object.assign({}, order), { lastEdited,
            totalPrice });
        // Update order in one go woohoo
        const updatedOrderId = yield (0, dataStore_1.addOrder)(updatedOrder);
        // TAKEN FROM LACH
        // Helper function generates UBl document.
        if (orderId !== null) {
            const UBLDocument = (0, helper_1.generateUBL)(orderId, updatedOrder);
            console.log(UBLDocument);
            (0, dataStore_1.addOrderXML)(orderId, UBLDocument);
        }
        // Return updated orderId
        return updatedOrderId;
    });
}
const orderConfirm = (userId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await getUser(userId);
    // if (!user) {
    //     throw new Error("invalid userId");
    // }
    // const orderData = await getOrder(orderId);
    // if (!orderData) {
    //     throw new Error("invalid orderId");
    // }
    // const { order, items } = orderData;
    // if (order.status === status.CONFIRMED) {
    //     return {};
    // }
    // order.status = status.CONFIRMED;
    // const updateSuccess = await updateOrder(order, items);
    // if (!updateSuccess) {
    //     throw new Error("failed to update order status to confirmed");
    // }
    // return {};
});
exports.orderConfirm = orderConfirm;
