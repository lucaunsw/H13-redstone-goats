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

function orderUserSales(CSV: boolean, JSON: boolean, PDF: boolean, userId: number) {

}

export { orderCancel, orderUserSales };
