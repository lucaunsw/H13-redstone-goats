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