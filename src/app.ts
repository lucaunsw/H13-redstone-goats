import { Order } from './types';

/**
 * Create an order and produce a UBL document, and return the
 * orderId value
 *
 * @param {Order} order - object containing all the order information
 * @returns {{ orderId: number }} orderId - Unique identifier for an order
 */
function orderCreate (order: Order) {
  // check if userId exists 
  // check name
  // check if items exist?
  if (order.billingDetails.creditCardNumber > 9999999999999999 || 
    order.billingDetails.creditCardNumber < 100000000000) {
    throw new Error ('Invalid bank details');
  }
  const date = new Date();
  order.lastEdited = date;
  // database.push(order);
  
  return;
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
