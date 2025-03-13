import { OrderParam, status } from './types';
import { generateUBL, userExists } from './helper';
import { getUser, addOrder } from './dataStore'

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
  if (order.delivery.startDate < currDate || order.delivery.endDate < currDate) {
    throw new Error ('Invalid date');
  }

  order.lastEdited = currDate;
  order.status = status.PENDING;
  
  const orderId = await addOrder(order, order.items);
  
  if (orderId !== null) {
    const UBLDocument = generateUBL(orderId, order);
  }
  return { orderId };
}


const orderCancel = (userId: string, orderId: string, reason: string) => {
  //   const data = getData();
  //   if (!data.orders || !data.orders[userId]) {
  //     throw new Error("invalid userId");
  //   }
  //   const userOrders = data.orders[userId];
  //   const order = userOrders.find((o) => o.orderId === orderId);
  //   if (!order) {
  //     throw new Error("invalid orderId");
  //   }
  //   if (order.status === "cancelled") {
  //     throw new Error("order already cancelled");
  //   }
  //   order.status = "cancelled";
  //   saveData(data);
  //   return { reason };
};

export { orderCreate, orderCancel };
