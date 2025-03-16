// import { OrderParam, status } from './types';
import { generateUBL, userExists } from './helper';
import { getUser, addOrder, getOrder, updateOrder } from './dataStore'

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



export { orderCancel };


/**
 * Update the quantity of specific items in an order.
 *
 * Iterates through the provided array of items, updating the quantities of each item
 *
 * @param {string} orderId - unique Id given to each order
 * @param {Array<{itemId: number, newQuantity: number}>} items - An array of items to be updated, 
 * where each item contains the item's ID and the new quantity to be set.
 * 
 * @returns {Promise<{
 *  orderId: number, 
 *  newVersionId: number, 
 *  timeLastEdited: number,
 *  reason: string,
 *  versions: number[]}>} 
 * Returns a promise that resolves to an object with the following structure:
 * - `orderId`: The ID of the order (does not change)
 * - `newVersionId`: The ID of the newly created version of the order (new Id created for each change)
 * - `timeLastEdited`: The timestamp of when the order was last edited
 * - `reason`: A string describing the reason for the update (e.g., "Item quantity update")
 * - `versions`: An array of version ID's representing the historical versions
 *
 * @throws {Error} 
 */

export async function orderChange(orderId: string, items: { itemId: number, newQuantity: number }[]): Promise<any> {
  try {
    // Fetch the order using the orderId (validate if order exists)
    const order = await getOrder(orderId); // This should fetch the order and throw an error if it doesn't exist
    if (!order) {
      throw new Error('invalid orderId');  // Return an error if order is not found
    }

    // Initialise a list to store updated items (you may need to process the items further depending on logic)
    const updatedOrderItems: OrderItem[] = [];

    // Iterate over the items and process each one (updating quantities)
    for (const item of items) {
      // Fetch the current item (assuming you have a function to get an item)
      const existingItem = await getItem(item.itemId);  // Get item details from database or service
      if (!existingItem) {
        throw new Error(`Item with id ${item.itemId} does not exist`); // Handle item not found
      }

      // Prepare an updated order item with the new quantity
      const updatedItem: OrderItem = {
        orderId: parseInt(orderId),  // Ensure the orderId is an integer
        itemId: item.itemId,
        quantity: item.newQuantity,
      };

      updatedOrderItems.push(updatedItem);  // Add the updated item to the list
    }

    // Call the function to update order items in the database/service
    const updatedOrder = await updateOrderItems(orderId, updatedOrderItems);  // Update items in the order

    return updatedOrder;  // Return the updated order after processing the changes

  } catch (error) {
    throw new Error(error.message);  // Rethrow the error if something goes wrong
  }
}

export { orderCreate, orderCancel };

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
