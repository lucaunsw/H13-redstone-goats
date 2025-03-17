import { Order, status, Item } from './types';
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

  // Iterate over each item in updatedData object
  for (const item of updatedData.items) {
    // Check if item exists in DB
    const existingItem = await getItem(item.itemId);
    if (!existingItem) {
      // If item does not exist in DB, construct and add to DB
      const newItem: Item = {
        id: item.itemId,
        name: 'Default Name',
        seller: { id: 1, name: 'Default Seller' },
        description: 'Default Description', 
        price: 0, 
      };
      await addItem(newItem);
    } // Otherwise, if item exists, update order DB in next step 

    // Check if the item exists in the order
    const itemIndex = order.items.findIndex(orderItem => orderItem.id === item.itemId);

    if (item.newQuantity === 0) {
      // If quantity is 0, delete the item from the order
      if (itemIndex !== -1) {
        order.items.splice(itemIndex, 1);
        order.quantities.splice(itemIndex, 1);
      }

    } else if (itemIndex !== -1) {
      // If the item exists in the order, update its quantity
      if (order.quantities[itemIndex] !== item.newQuantity) {
        order.quantities[itemIndex] = item.newQuantity;
      }

    } else {
      // If the item doesn't exist in the order, add it
      order.items.push({ id: item.itemId, name: 'Default Name', seller: { id: 1, name: 'Default Seller' }, description: 'Default Description', price: 0 });
      order.quantities.push(item.newQuantity);
    }
  }

  // Recalculate total price


  // Prepare updated order object
  const updatedOrder: Order = {
    ...order,
    items: order.items, // Updated
    quantities: order.quantities, // Updated
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

export { orderCreate, orderCancel, orderConfirm, orderChange };