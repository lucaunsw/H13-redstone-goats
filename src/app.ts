import { ItemV1, ItemSalesV1, OrderV1, OrderV2, status } from './types';
import { generateUBL, v2generateUBL, userExists, v2userExists, validItemList, 
         v2validItemList, addItems, validSellers, v2validSellers,
         generatePDF } from './helper';
import { getUserV1, addOrderV1, getOrderV1, updateOrderV1, 
  addOrderXMLV1, getOrderXMLV1, getItemSellerSalesV1,
  getItemBuyerRecommendationsV1,
  getPopularItemsV1, getOrdersByBuyerV1
 } from './dataStoreV1'

import {
  addOrderV2, 
} from './dataStoreV2'
 import fs from 'fs';
import { stringify } from 'csv-stringify/sync';
import path from 'path';

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderV1} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
async function orderCreate (order: OrderV1) {
  if (!order.buyer.id) {
    throw new Error ('No userId provided');
  }
  const user = await userExists(order.buyer.id, order.buyer.name);
  if (!user) {
    throw new Error 
    ('Invalid userId or a different name is registered to userId');
  }

  // Throw error for invalid bank details
  if (order.billingDetails.creditCardNumber.length < 12 ||
      order.billingDetails.creditCardNumber.length > 16 ||
      !/^[0-9]+$/.test(order.billingDetails.creditCardNumber)) {
    throw new Error ('Invalid bank details');
  }

  // Throw error for invalid date selection.
  const currDate = new Date().toISOString().split('T')[0];
  if (order.delivery.startDate < currDate || order.delivery.endDate < currDate
    || order.delivery.startDate > order.delivery.endDate) {
    throw new Error ('Invalid date selection');
  }

  // If an invalid amount of item quantities are provided, throw error.
  if (order.items.length !== order.quantities.length) {
    throw new Error ('Invalid amount of item quantities provided');
  }

  // Checks if sellers are valid.
  const sellersValid = await validSellers(order);
  if (!sellersValid) {
    throw new Error ('Invalid seller(s)');
  }

  // Helper function checks if all items/quantities are valid and returns the 
  // total price if so.
  const totalPrice = await validItemList(order);
  // Throw error if inputted total price is incorrect.
  if (totalPrice !== order.totalPrice) {
    throw new Error ('Incorrect total price provided');
  }

  // Helper function adds all items to item datastore.
  await addItems(order);
  order.lastEdited = currDate;
  order.status = status.PENDING;
  const orderId = await addOrderV1(order);

  // Helper function generates UBl document.
  if (orderId !== null) {
    const UBLDocument = generateUBL(orderId, order);
    await addOrderXMLV1(orderId, UBLDocument);
  }
  return { orderId };
}

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderV2} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
async function v2orderCreate (order: OrderV2) {
  if (!order.buyer.id) {
    throw new Error ('No userId provided');
  }
  const user = await v2userExists(order.buyer.id, order.buyer.name);
  if (!user) {
    throw new Error 
    ('Invalid userId or a different name is registered to userId');
  }

  // Throw error for invalid bank details
  if (order.billingDetails.creditCardNumber.length < 12 ||
      order.billingDetails.creditCardNumber.length > 16 ||
      !/^[0-9]+$/.test(order.billingDetails.creditCardNumber)) {
    throw new Error ('Invalid bank details');
  }

  if (order.buyer.phone && (order.buyer.phone.length < 3 ||
    order.buyer.phone.length > 15 ||
    !/^\+?[0-9]+$/.test(order.buyer.phone))) {
    throw new Error ('Invalid buyer phone number entered');
  }

  // Throw error for invalid date selection.
  const currDate = new Date().toISOString().split('T')[0];
  if (order.delivery.startDate < currDate || order.delivery.endDate < currDate
    || order.delivery.startDate > order.delivery.endDate) {
    throw new Error ('Invalid date selection');
  }

  // If an invalid amount of item quantities are provided, throw error.
  if (order.items.length !== order.quantities.length) {
    throw new Error ('Invalid amount of item quantities provided');
  }

  if (order.taxAmount && (order.taxAmount < 0 || order.taxAmount >= 100)) {
    throw new Error ('Invalid tax amount entered');
  }

  // Checks if sellers are valid.
  const sellersValid = await v2validSellers(order);
  if (!sellersValid) {
    throw new Error ('Invalid seller(s)');
  }

  // Helper function checks if all items/quantities are valid and returns the 
  // total price if so.
  const totalPrice = await v2validItemList(order);
  // Throw error if inputted total price is incorrect.
  if (totalPrice !== order.totalPrice) {
    throw new Error ('Incorrect total price provided');
  }

  if (order.taxTotal && order.taxAmount && 
    (order.taxTotal !== order.totalPrice * (order.taxAmount / 100))) {
    throw new Error ('Invalid total tax amount entered');
  }

  order.lastEdited = currDate;
  order.status = status.PENDING;
  const orderId = await addOrderV2(order);

  // Helper function generates UBl document.
  if (orderId !== null) {
    const UBLDocument = v2generateUBL(orderId, order);
    await addOrderXMLV1(orderId, UBLDocument);
  }
  return { orderId };
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
const orderCancel = async (userId: number, orderId: number, reason: string) => {
  // Check if userId and orderId are valid
  const user = await getUserV1(userId);
  if (!user) {
      throw new Error("invalid userId");
  }
  const orderData = await getOrderV1(orderId);
  if (!orderData) {
      throw new Error("invalid orderId");
  }

  // Check if status is already cancelled
  if (orderData.status === status.CANCELLED) {
      throw new Error("order already cancelled");
  }
  orderData.status = status.CANCELLED;

  // Update order object in database
  const updateSuccess = await updateOrderV1(orderData);
  if (!updateSuccess) {
      throw new Error("failed to update order status to cancelled");
  }

  return { reason };
};

/**
 * Confirms an order for a given user.
 * 
 * @param {number} userId - The ID of the user requesting the confirmation.
 * @param {number} orderId - The ID of the order to be confirmed.
 * @returns {Promise<{ UBL?: string }>} - A confirmation object containing the order's UBL data (if available).
 * @throws {Error} - If the user ID or order ID is invalid, the order is cancelled, or the update fails.
 */
const orderConfirm = async (userId: number, orderId: number) => {
  // Check if userId and orderId are valid  
  const user = await getUserV1(userId);
  if (!user) {
      throw new Error("invalid userId");
  }
  const orderData = await getOrderV1(orderId);
  if (!orderData) {
      throw new Error("invalid orderId");
  }

  // Check if order status is cancelled
  if (orderData.status === status.CANCELLED) {
    throw new Error('order has been cancelled');
  }

  if (orderData.status === status.CONFIRMED) {
      return {};
  }
  orderData.status = status.CONFIRMED;

  // Update order object in database
  const updateSuccess = await updateOrderV1(orderData);
  if (!updateSuccess) {
      throw new Error("failed to update order status to confirmed");
  }

  // Fetch and return XML associated with order
  const UBL = await getOrderXMLV1(Number(orderData.orderXMLId));
  return { UBL };
};

/** Seller route to return sales information to the seller.
 *
 * @param {boolean} csv - boolean to state if the csv data option is desired.
 * @param {boolean} json - boolean to state if the json data option is desired.
 * @param {boolean} pdf - boolean to state if the pdf data option is desired.
 * @param {number | null} sellId - Unique identifier for a seller.
 * @returns { sales?: ItemSales[]; CSVurl?: string; PDFurl?: string } 
 * returnBody - an object which can contain: the csv url, json body, pdf for sales info.
 */
async function orderUserSales(csv: boolean, json: boolean, pdf: boolean, sellerId: number | null) {
  if (!csv && !json && !pdf) {
    throw new Error ('At least one data option should be selected');
  }
  if (!sellerId) {
    throw new Error ('No sellerId provided');
  }
  const seller = await getUserV1(sellerId);
  
  if (!seller) {
    throw new Error ('Invalid sellerId');
  }

  const returnBody: { sales?: ItemSalesV1[]; CSVurl?: string
    ; PDFurl?: string } = {};

  const sales = await getItemSellerSalesV1(sellerId);
  // Convert sales information to type number.
  for (const item of sales) {
    item.amountSold = Number(item.amountSold);
    item.price = Number(item.price);
  }

  // Create path to sales_report csv directory.
  const CSVdirPath = path.join(__dirname, 'sales_reports_csv');

  // Create path to sales_report pdf directory.
  const PDFdirPath = path.join(__dirname, 'sales_reports_pdf');

  if (json) {
    returnBody.sales = sales;
  }
  
  if (csv) {
    // Convert sales data from json body to a csv-format string.
    const csvString = stringify(sales, {
      header: true,
      columns: ['id', 'name', 'description', 'price', 'amountSold'],
    });
    // Create the path to the csv file
    const filePath = path.join(CSVdirPath, `sales_${sellerId}.csv`);

    // Fill the csv with sales info.
    fs.writeFileSync(filePath, csvString);
    // Place CSV url into body.
    returnBody.CSVurl = `/sales_reports_csv/sales_${sellerId}.csv`;
  }

  if (pdf) {
    await generatePDF(sales, sellerId, PDFdirPath);
    returnBody.PDFurl = `/sales_reports_pdf/sales_${sellerId}.pdf`
    
  }

  return returnBody;
}

/**
 * Recommends items to order for a given user (as many as can be given up to a given number).
 * 
 * @param {number} userId - The ID of the user requesting recommendations.
 * @param {number} limit - How many items the user wants to be recommended.
 * @returns {Promise<{ recommendations: Item[] }>} - A confirmation object containing the order's UBL data (if available).
 */
const orderRecommendations = async (userId: number, limit: number) => {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error ('Limit is not a positive integer');
  }
  // Check if userId is valid  
  const user = await getUserV1(userId);
  if (!user) {
    throw new Error("Invalid userId");
  }

  const recommendedItems: ItemV1[] = await getItemBuyerRecommendationsV1(userId, limit);
  if (recommendedItems.length === limit) return { recommendations: recommendedItems };

  const popularItems: ItemV1[] = await getPopularItemsV1(limit);
  for (let index = 0; index < popularItems.length; index++) {
    if (recommendedItems.length === limit) return { recommendations: recommendedItems };

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
};

/** Returns orderhistory
*
* @param {number | null} userId - Unique identifier for a user.
* @returns { successfulOrders: [], cancelledOrders: [] } 
*/

const orderHistory = async (userId: number) => {

  // Checks for userId
  if (!userId) {
    throw new Error ('No userId provided');
  }
  const user = await getUserV1(userId);
  if (!user) {
    throw new Error 
    ('Invalid userId');
  }

  const orders = await getOrdersByBuyerV1(userId);
  const successfulOrders: OrderV1[] = [];
  const cancelledOrders: OrderV1[] = [];

  for (const order of orders) {
    if (order.status === "cancelled") {
      cancelledOrders.push(order);
    } else {
      successfulOrders.push(order);
    }
  }

  return { successfulOrders: successfulOrders, 
           cancelledOrders: cancelledOrders };
}

export { orderCreate, v2orderCreate, orderCancel, orderConfirm, orderUserSales, orderRecommendations, orderHistory };