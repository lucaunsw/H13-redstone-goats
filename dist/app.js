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
exports.orderRecommendations = exports.orderConfirm = exports.orderCancel = void 0;
exports.orderCreate = orderCreate;
exports.orderUserSales = orderUserSales;
const types_1 = require("./types");
const helper_1 = require("./helper");
const dataStore_1 = require("./dataStore");
const fs_1 = __importDefault(require("fs"));
const sync_1 = require("csv-stringify/sync");
const path_1 = __importDefault(require("path"));
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
        // Throw error for invalid bank details
        if (order.billingDetails.creditCardNumber.length < 12 ||
            order.billingDetails.creditCardNumber.length > 16 ||
            !/^[0-9]+$/.test(order.billingDetails.creditCardNumber)) {
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
        // Checks if sellers are valid.
        const sellersValid = yield (0, helper_1.validSellers)(order);
        if (!sellersValid) {
            throw new Error('Invalid seller(s)');
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
/**
 * Cancels an order for a given user with a specified reason.
 *
 * @param {number} userId - The ID of the user requesting the cancellation.
 * @param {number} orderId - The ID of the order to be cancelled.
 * @param {string} reason - The reason for cancelling the order.
 * @returns {Promise<{ reason: string }>} - A confirmation object containing the cancellation reason.
 * @throws {Error} - If the user ID or order ID is invalid, the order is already cancelled, or the update fails.
 */
const orderCancel = (userId, orderId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if userId and orderId are valid
    const user = yield (0, dataStore_1.getUser)(userId);
    if (!user) {
        throw new Error("invalid userId");
    }
    const orderData = yield (0, dataStore_1.getOrder)(orderId);
    if (!orderData) {
        throw new Error("invalid orderId");
    }
    // Check if status is already cancelled
    if (orderData.status === types_1.status.CANCELLED) {
        throw new Error("order already cancelled");
    }
    orderData.status = types_1.status.CANCELLED;
    // Update order object in database
    const updateSuccess = yield (0, dataStore_1.updateOrder)(orderData);
    if (!updateSuccess) {
        throw new Error("failed to update order status to cancelled");
    }
    return { reason };
});
exports.orderCancel = orderCancel;
/**
 * Confirms an order for a given user.
 *
 * @param {number} userId - The ID of the user requesting the confirmation.
 * @param {number} orderId - The ID of the order to be confirmed.
 * @returns {Promise<{ UBL?: string }>} - A confirmation object containing the order's UBL data (if available).
 * @throws {Error} - If the user ID or order ID is invalid, the order is cancelled, or the update fails.
 */
const orderConfirm = (userId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if userId and orderId are valid  
    const user = yield (0, dataStore_1.getUser)(userId);
    if (!user) {
        throw new Error("invalid userId");
    }
    const orderData = yield (0, dataStore_1.getOrder)(orderId);
    if (!orderData) {
        throw new Error("invalid orderId");
    }
    // Check if order status is cancelled
    if (orderData.status === types_1.status.CANCELLED) {
        throw new Error('order has been cancelled');
    }
    if (orderData.status === types_1.status.CONFIRMED) {
        return {};
    }
    orderData.status = types_1.status.CONFIRMED;
    // Update order object in database
    const updateSuccess = yield (0, dataStore_1.updateOrder)(orderData);
    if (!updateSuccess) {
        throw new Error("failed to update order status to confirmed");
    }
    // Fetch and return XML associated with order
    const UBL = yield (0, dataStore_1.getOrderXML)(Number(orderData.orderXMLId));
    return { UBL };
});
exports.orderConfirm = orderConfirm;
/** Seller route to return sales information to the seller.
 *
 * @param {boolean} csv - boolean to state if the csv data option is desired.
 * @param {boolean} json - boolean to state if the json data option is desired.
 * @param {boolean} pdf - boolean to state if the pdf data option is desired.
 * @param {number | null} sellId - Unique identifier for a seller.
 * @returns { sales?: ItemSales[]; CSVurl?: string; PDFurl?: string }
 * returnBody - an object which can contain: the csv url, json body, pdf for sales info.
 */
function orderUserSales(csv, json, pdf, sellerId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!csv && !json && !pdf) {
            throw new Error('At least one data option should be selected');
        }
        if (!sellerId) {
            throw new Error('No sellerId provided');
        }
        const seller = yield (0, dataStore_1.getUser)(sellerId);
        if (!seller) {
            throw new Error('Invalid sellerId');
        }
        const returnBody = {};
        const sales = yield (0, dataStore_1.getItemSellerSales)(sellerId);
        // Convert sales information to type number.
        for (const item of sales) {
            item.amountSold = Number(item.amountSold);
            item.price = Number(item.price);
        }
        // Create path to sales_report csv directory.
        const CSVdirPath = path_1.default.join(__dirname, 'sales_reports_csv');
        // Create path to sales_report pdf directory.
        const PDFdirPath = path_1.default.join(__dirname, 'sales_reports_pdf');
        if (json) {
            returnBody.sales = sales;
        }
        if (csv) {
            // Convert sales data from json body to a csv-format string.
            const csvString = (0, sync_1.stringify)(sales, {
                header: true,
                columns: ['id', 'name', 'description', 'price', 'amountSold'],
            });
            // Create the path to the csv file
            const filePath = path_1.default.join(CSVdirPath, `sales_${sellerId}.csv`);
            // Fill the csv with sales info.
            fs_1.default.writeFileSync(filePath, csvString);
            // Place CSV url into body.
            returnBody.CSVurl = `/sales_reports_csv/sales_${sellerId}.csv`;
        }
        if (pdf) {
            yield (0, helper_1.generatePDF)(sales, sellerId, PDFdirPath);
            returnBody.PDFurl = `/sales_reports_pdf/sales_${sellerId}.pdf`;
        }
        return returnBody;
    });
}
/**
 * Recommends items to order for a given user (as many as can be given up to a given number).
 *
 * @param {number} userId - The ID of the user requesting recommendations.
 * @param {number} limit - How many items the user wants to be recommended.
 * @returns {Promise<{ recommendations: Item[] }>} - A confirmation object containing the order's UBL data (if available).
 */
const orderRecommendations = (userId, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error('Limit is not a positive integer');
    }
    // Check if userId is valid  
    const user = yield (0, dataStore_1.getUser)(userId);
    if (!user) {
        throw new Error("Invalid userId");
    }
    const recommendedItems = yield (0, dataStore_1.getItemBuyerRecommendations)(userId, limit);
    if (recommendedItems.length === limit)
        return { recommendations: recommendedItems };
    const popularItems = yield (0, dataStore_1.getPopularItems)(limit);
    for (let index = 0; index < popularItems.length; index++) {
        if (recommendedItems.length === limit)
            return { recommendations: recommendedItems };
        let unique = true;
        for (const recommendedItem of recommendedItems) {
            if (recommendedItem.name == popularItems[index].name &&
                recommendedItem.seller.id == popularItems[index].seller.id) {
                unique = false;
            }
        }
        if (unique) {
            recommendedItems.push(popularItems[index]);
        }
    }
    return { recommendations: recommendedItems };
});
exports.orderRecommendations = orderRecommendations;
