import { OrderParam, status } from './types';
import { generateUBL } from './helper';
import { getAllUsers, getOrder, getUser, updateOrder } from './dataStore'

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderParam} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
function orderCreate (order: OrderParam) {
  // const users = await getAllUsers();
  // for (const user of users) {

  // }
  // check if userId exists 
  // check name
  // check if items exist?
  if (order.billingDetails.creditCardNumber > 9999999999999999 || 
    order.billingDetails.creditCardNumber < 100000000000) {
    throw new Error ('Invalid bank details');
  }
  const date = new Date().toISOString().split('T')[0];;
  order.lastEdited = date;
  // database.push(order);
  // const orderId = store.size + 1;
  // database.push(orderId);

  // const UBLDocument = generateUBL(orderId, order);
  // return orderId;
  return;
}

const orderCancel = async (userId: number, orderId: number, reason: string) => {
    // Check if userId and orderId are valid
    const user = await getUser(userId);
    if (!user) {
        throw new Error("invalid userId");
    }
    const orderData = await getOrder(orderId);
    if (!orderData) {
        throw new Error("invalid orderId");
    }
    const { order, items } = orderData;

    if (order.status === status.CANCELLED) {
        throw new Error("order already cancelled");
    }
    order.status = status.CANCELLED;

    const updateSuccess = await updateOrder(order, items);
    if (!updateSuccess) {
        throw new Error("failed to update order status to cancelled");
    }

    return { reason };
};


const orderConfirm = async (userId: number, orderId: number) => {
    const user = await getUser(userId);
    if (!user) {
        throw new Error("invalid userId");
    }
    const orderData = await getOrder(orderId);
    if (!orderData) {
        throw new Error("invalid orderId");
    }
    const { order, items } = orderData;

    if (order.status === status.CONFIRMED) {
        return {};
    }
    order.status = status.CONFIRMED;

    const updateSuccess = await updateOrder(order, items);
    if (!updateSuccess) {
        throw new Error("failed to update order status to confirmed");
    }

    return {};
};

export { orderCreate, orderCancel, orderConfirm };
