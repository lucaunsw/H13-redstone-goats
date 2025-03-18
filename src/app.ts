import { Order, status } from './types';
import { generateUBL, userExists, validItemList, addItems } from './helper';
import { getUser, addOrder, getOrder, updateOrder, addItem,
  getItem, addOrderXML
 } from './dataStore'

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderParam} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
async function orderCreate (order: Order) {
  if (!order.buyer.id) {
    throw new Error ('No userId provided');
  }
  const user = await userExists(order.buyer.id, order.buyer.name);
  if (!user) {
    throw new Error 
    ('Invalid userId or a different name is registered to userId');
  }

  // Throw error for invalid bank details.
  if (order.billingDetails.creditCardNumber > 9999999999999999 || 
    order.billingDetails.creditCardNumber < 100000000000) {
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
  const orderId = await addOrder(order);

  // Helper function generates UBl document.
  if (orderId !== null) {
    const UBLDocument = generateUBL(orderId, order);
    await addOrderXML(orderId, UBLDocument);
  }
  return { orderId };
}


const orderCancel = async (userId: number, orderId: number, reason: string) => {
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
};


const orderConfirm = async (userId: number, orderId: number) => {
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
};

async function orderUserSales(csv: boolean, json: boolean, pdf: boolean, sellerId: number) {
  if (!csv && !json && !pdf) {
    throw new Error ('At least one data option should be selected');
  }
  if (!sellerId) {
    throw new Error ('No sellerId provided');
  }
  const seller = await getUser(sellerId);
  if (!seller) {
    throw new Error ('Invalid sellerId');
  }

  return;
}

export { orderCreate, orderCancel, orderConfirm, orderUserSales };
