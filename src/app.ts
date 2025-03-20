import { Order, status, Item, UserSimple } from './types';
import { generateUBL, userExists, validItemList, addItems } from './helper';
import { getUser, addOrder, getOrder, updateOrder, addItem,
  getItem, addOrderXML,
  getOrderXML
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
  // Check if userId and orderId are valid
  const user = await getUser(userId);
  if (!user) {
      throw new Error("invalid userId");
  }
  const orderData = await getOrder(orderId);
  console.log(orderData);
  if (!orderData) {
      throw new Error("invalid orderId");
  }

  if (orderData.status === status.CANCELLED) {
      throw new Error("order already cancelled");
  }
  orderData.status = status.CANCELLED;

  const updateSuccess = await updateOrder(orderData);
  if (!updateSuccess) {
      throw new Error("failed to update order status to cancelled");
  }

  return { reason };
};

/**
 * Change an existing order's items (not metadata)
 *
 * @param {number} userId - Unique identifier for each user
 * @param {number} orderId - Unique identifier for an order
 * @param {Array} items - Array containing updated item details (item Id, item quantity)
 * @returns {number} orderId - Unique identifier for an order
 */

async function orderChange(
  userId: number, 
  orderId: number, 
  updatedData: {
    items: Array<{ 
      itemId: number; 
      newQuantity: number;
      name: string;
      seller: UserSimple;
      description: string;
      price: number
    }>;
  }
){ 

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




  // // // Calculate updated price: cannot use this function as it throws an error when 
  // // // an existing itemId is inputted, change this prolly?
  // // const totalPrice = await validItemList({
  // //   ...order,
  // //   items: updatedData.items,
  // //   quantities: updatedData.items.map(item => item.newQuantity)});

  // const totalPrice = 200 // Placeholder value

  // // Set current time for lastEdited:
  // const lastEdited = new Date().toISOString();

  // // MODIFY ITEMS LOCALLY - Since orderUpdate db function updates all at once. must handle insertion/deleetion
  // // logic prior to db push

  // // Iterate over the provided updated items
  // for (const item of updatedData.items) {
  //   const itemIndex = order.items.findIndex(orderItem => orderItem.id === item.itemId);
  //   const existingItem = await getItem(item.itemId);
  //   if (existingItem) {
  //     // If item exists and quantity is > 0, update quantity
  //     if (item.newQuantity > 0) {
  //       order.quantities[itemIndex] = item.newQuantity;

  //     // If item exists and quantity is = 0, remove item
  //     } else if (item.newQuantity === 0) {
  //       order.items.splice(itemIndex, 1); 
  //       order.quantities.splice(itemIndex, 1); 
  //     } 
  //     // If item does not exist, add new item to order
  //   } else {
  //     order.items.push({ 
  //       id: item.itemId, 
  //       name: item.name,
  //       seller: item.seller, 
  //       description: item.description,
  //       price: item.price 
  //     });
  //     order.quantities.push(item.newQuantity);
  //   }
  // }

  // // Create updatedOrder object to parse into db function
  // const updatedOrder = {
  //   ...order,
  //   lastEdited,
  //   totalPrice,
  // };

  // // Update order in one go woohoo
  // const updatedOrderId = await addOrder(updatedOrder);

  // // TAKEN FROM LACH
  // // Helper function generates UBl document.
  // if (orderId !== null) {
  //   const UBLDocument = generateUBL(orderId, updatedOrder);
  //   console.log(UBLDocument);
  //   addOrderXML(orderId, UBLDocument);
  // }

  // // Return updated orderId
  // return updatedOrderId;





  return orderId;
}

const orderConfirm = async (userId: number, orderId: number) => {
    const user = await getUser(userId);
    if (!user) {
        throw new Error("invalid userId");
    }
    const orderData = await getOrder(orderId);
    if (!orderData) {
        throw new Error("invalid orderId");
    }

    if (orderData.status === status.CANCELLED) {
      throw new Error('order has been cancelled');
    }

    if (orderData.status === status.CONFIRMED) {
        return {};
    }
    orderData.status = status.CONFIRMED;

    const updateSuccess = await updateOrder(orderData);
    if (!updateSuccess) {
        throw new Error("failed to update order status to confirmed");
    }

    const UBL = await getOrderXML(Number(orderData.orderXMLId));
    return { UBL };
};

export { orderCreate, orderCancel, orderConfirm, orderChange };