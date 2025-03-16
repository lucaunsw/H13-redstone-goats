// import { OrderParam, status, UpdatedData, ItemUpdate } from './types';
import { generateUBL, userExists } from './helper';
import { getUser, addOrder, getOrder, updateOrder } from './dataStore'




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
 * Change an existing order's items and update other fields
 *
 * @param {number} orderId - 
 * @param {Array} items - 
 * @param {number} totalPrice - 
 * @param {string} status - 
 * @returns 
 */

async function orderChange(
  userId: string, 
  orderId: string, 
  updatedData: { itemId: number, newQuantity: number }[]
): Promise<order> { 

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

    // [ERROR CHECKING] Valid ItemId + Quantity
    for (const item of updatedData) {
      const existingItem = await getItem(item.itemId);
      if (!existingItem) {
        throw new Error(`Item with id ${item.itemId} does not exist`);
      }

      if (item.newQuantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.itemId}`);
      }
    }

// Update Order Items
const updatedOrderItems: OrderItem[] = updatedData.map((item) => ({
  orderId,
  itemId: item.itemId,
  quantity: item.newQuantity,
}));

// Update the order in the database/service
const updatedOrder = await updateOrderItems(orderId, updatedOrderItems);

return updatedOrder; /// NOT SURE WAT TO RETURN LOL
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
