import { OrderParam, status, UpdatedData, ItemUpdate, Order } from './types';
import { generateUBL, userExists, addItems } from './helper';
import { getUser, addOrder, getOrder, updateOrder, getItem, addItem} from './dataStore'

// /**
//  * Create an order and produce a UBL document, and return the
//  * orderId value
//  *
//  * @param {OrderParam} order - object containing all the order information
//  * @returns {{ orderId: number }} orderId - Unique identifier for an order
//  */
// async function orderCreate (order: OrderParam) {
//   const user = await getUser(order.user.userId);
  
//   if (!userExists(order.user.userId, order.user.name)) {
//     throw new Error 
//     ('Invalid userId or a different name is registered to userId');
//   }

//   if (order.billingDetails.creditCardNumber > 9999999999999999 || 
//     order.billingDetails.creditCardNumber < 100000000000) {
//     throw new Error ('Invalid bank details');
//   }

//   const currDate = new Date().toISOString().split('T')[0];
//   if (order.delivery.startDate < currDate || order.delivery.endDate < currDate
//     || order.delivery.startDate > order.delivery.endDate) {
//     throw new Error ('Invalid date selection');
//   }

//   for (const item of order.items) {
//     if (item.price < 0) {
//       throw new Error ('Invalid item price');
//     }
//   }

//   order.lastEdited = currDate;
//   order.status = status.PENDING;
  
//   // const orderId = await addOrder(order, order.items);
  
//   // if (orderId !== null) {
//   //   const UBLDocument = generateUBL(orderId, order);
//   // }
//   // return { orderId };
//   return;
// }


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






/**
 * Change an existing order's items and update other fields
 *
 * @param {number} userId - Unique identifier for each user (MAYBE UNECCESSARY?)
 * @param {number} orderId - Unique identifier for an order
 * @param {Array} items - Array containing updated item details (item Id, item quantity)
 * @returns {number} orderId - Unique identifier for an order
 */

async function orderChange(
  userId: number, 
  orderId: number, 
  updatedData: {
    items: Array<{ itemId: number, newQuantity: number }>;
  }
): Promise<any> { 

  // [ERROR CHECKING] OrderId Exists
  const order = await getOrder(orderId); 
  if (!order) {
    throw new Error('Invalid orderId'); 
  }

  // [ERROR CHECKING] UserId Exists
  const user = await getUser(userId);
  if (!user) {
    throw new Error('Invalid userId');
  }

  // // Calculate updated price: cannot use this function as it throws an error when 
  // // an existing itemId is inputted, change this prolly?
  // const totalPrice = await validItemList({
  //   ...order,
  //   items: updatedData.items,
  //   quantities: updatedData.items.map(item => item.newQuantity)});
  const totalPrice = 200 // Placeholder value

  // Set current time for lastEdited:
  const lastEdited = new Date().toISOString();

  // Check for existing item 
  for (const item of updatedData.items) {
    const existingItem = await getItem(item.itemId);
    if (!existingItem) {
      // Item does not exist in DB, add to DB
      const newItem = getItem(item.itemId);
      await addItem(item);
    } // Otherwise, if item exists, update order DB in next step 
  }

  // Prepare updated order object
  const updatedOrder: Order = {
    ...order,
    items: updatedData.items.map(item => ({
      id: item.itemId, 
      price: item.price,
      quantity: item.newQuantity // Updated field!
    })),
    quantities: updatedData.items.map(item => item.newQuantity), // Updated field!
    totalPrice: totalPrice,  // Updated field!
    lastEdited: lastEdited,  // Updated field!
    status: order.status,  
    createdAt: order.createdAt
  };

  // Update order in one go woohoo
  const updatedOrderId = await addOrder(updatedOrder);

  // TAKEN FROM LACH
  // Helper function generates UBl document.
  if (orderId !== null) {
    const UBLDocument = generateUBL(orderId, updatedOrder);
    console.log(UBLDocument);
    addOrderXML(orderId, UBLDocument);
  }

  // Return updated orderId
  return updatedOrderId;
}

export { orderCreate, orderCancel, orderChange };

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

// export { orderCreate, orderCancel, orderConfirm };
