import { OrderParam, status, status } from './types';
import { generateUBL, userExists } from './helper';
import { getUser, addOrder, getOrder, getUser, updateOrder } from './dataStore'

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {OrderParam} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
async function orderCreate (order: OrderParam) {
  const user = await getUser(order.user.userId);
  
  if (!userExists(order.user.userId, order.user.name)) {
    throw new Error 
    ('Invalid userId or a different name is registered to userId');
  }

  if (order.billingDetails.creditCardNumber > 9999999999999999 || 
    order.billingDetails.creditCardNumber < 100000000000) {
    throw new Error ('Invalid bank details');
  }

  const currDate = new Date().toISOString().split('T')[0];
  if (order.delivery.startDate < currDate || order.delivery.endDate < currDate
    || order.delivery.startDate > order.delivery.endDate) {
    throw new Error ('Invalid date selection');
  }

  for (const item of order.items) {
    if (item.price < 0) {
      throw new Error ('Invalid item price');
    }
  }

  order.lastEdited = currDate;
  order.status = status.PENDING;
  
  // const orderId = await addOrder(order, order.items);
  
  // if (orderId !== null) {
  //   const UBLDocument = generateUBL(orderId, order);
  // }
  // return { orderId };
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
