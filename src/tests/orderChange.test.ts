// import { orderChange } from '../app'; // Adjust the import according to your file structure
// import { SessionId, OrderParam, UserParam, 
//     Item, BillingDetailsParam, DeliveryInstructions, Order } from '../types';

//     jest.mock('../app', () => ({
//         orderChange: jest.fn(),
//       }));
      
//       const mockGetOrder = jest.fn();
//       const mockGetItem = jest.fn();
//       const mockAddOrder = jest.fn();

// import request from "sync-request-curl";

// // let user: {body: { token: SessionId }};
// let userId: number;
// let testName: string;
// let testUser: UserParam;
// let testSeller: UserParam;
// let testItem: Item;
// let testBillingDetails: BillingDetailsParam;
// let testDeliveryDetails: DeliveryInstructions;
// const date = new Date().toISOString().split('T')[0];

// beforeEach(async () => {

//   testName = 'Bobby Jones'
//   testSeller = {
//     userId: 2,
//     name: 'jim',
//     streetName: 'petal lane',
//     cityName: 'sydney',
//     postalZone: '2000',
//     cbcCode: '123'
//   }
//   testItem = {
//     id: 123,
//     name: 'soap',
//     seller: {testSeller},
//     description: 'This is soap',
//     price: 5,
//   };
//   testUser = {
//     userId: 1,
//     name: 'jessica',
//     streetName: 'White St',
//     cityName: 'Sydney',
//     postalZone: '2000',
//     cbcCode: 'AU',
//   };
//   testSeller = {
//     userId: 1,
//     name: 'Test Seller',
//     streetName: 'Yellow St',
//     cityName: 'Brisbane',
//     postalZone: '4000',
//     cbcCode: 'AU'
//   };
//   testBillingDetails = {
//     creditCardNumber: 1000000000000000,
//     CVV: 111,
//     expiryDate: date,
//   };
//   testDeliveryDetails = {
//     streetName: 'White St',
//     citName: 'Sydney',
//     postalZone: '2000',
//     countrySubentity: 'NSW',
//     addressLine: '33 White St, Sydney NSW',
//     cbcCode: 'AU',
//     startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
//     startTime: '13:00',
//     endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
//     endTime: '13:00'
//   }
//   const validItems = [
//     { orderId: validOrderId, itemId: 1, quantity: 5 },
//     { orderId: validOrderId, itemId: 5, quantity: 2 },
//   ];
  
//   const invalidItem = [
//     { orderId: validOrderId, itemId: 99, quantity: 3 },
//   ];
// });

// describe('Order Change Function', () => {
  

//   describe('OrderId is valid', () => {
//     test('error returned for invalid orderId', async () => {
//       // Setup mock for invalid orderId
//       mockGetOrder.mockResolvedValueOnce(null); // Simulate order not found

//       const response: OrderChangeResponse = await orderChange(invalidOrderId, validOrderId, { items: validItems });

//       expect(response.error).toBeDefined();
//       expect(response.success).toBe(false);
//     });

//     test('success returned for valid orderId', async () => {
//       // Setup mock for valid orderId
//       mockGetOrder.mockResolvedValueOnce({ orderId: validOrderId });

//       const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, { items: validItems });

//       expect(response.error).toBeUndefined();
//       expect(response.success).toBe(true);
//     });
//   });

//   describe('Order item updates', () => {
//     test('quantity updates correctly for existing order item', async () => {
//       // Setup mock for valid order and item
//       mockGetOrder.mockResolvedValueOnce({ orderId: validOrderId, items: validItems });
//       mockGetItem.mockResolvedValueOnce({ itemId: 1, price: 10, name: 'item1' });
//       mockAddOrder.mockResolvedValueOnce(validOrderId);

//       const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, [
//         { orderId: validOrderId, itemId: 1, quantity: 10 },
//       ]);

//       expect(response.success).toBe(true);
//       expect(response.updatedItems).toContainEqual({ orderId: validOrderId, itemId: 1, quantity: 10 });
//     });

//     test('error returned when updating non-existent item', async () => {
//       // Setup mock for invalid item
//       mockGetOrder.mockResolvedValueOnce({ orderId: validOrderId, items: validItems });
//       mockGetItem.mockResolvedValueOnce(null); // Simulate item not found

//       const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, invalidItem);

//       expect(response.success).toBe(false);
//       expect(response.error).toBeDefined();
//     });

//     test('order update fails when quantity is negative', async () => {
//       // Setup mock for valid order and item
//       mockGetOrder.mockResolvedValueOnce({ orderId: validOrderId, items: validItems });
//       mockGetItem.mockResolvedValueOnce({ itemId: 1, price: 10, name: 'item1' });

//       const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, [
//         { orderId: validOrderId, itemId: 1, quantity: -5 },
//       ]);

//       expect(response.success).toBe(false);
//       expect(response.error).toBeDefined();
//     });
//   });
// });


// // import { orderChange } from '../app'; // Adjust the import according to your file structure
// // import { OrderItem, OrderChangeResponse } from '../types';

// // // Mock data for testing
// // const validOrderId = '1'; // Assume a valid order ID in your DB
// // const invalidOrderId = '999'; // Assume an invalid order ID (non-existent)
// // const validItem = { orderId: validOrderId, itemId: 1, quantity: 5 };
// // const validItems: OrderItem[] = [
// //   { orderId: validOrderId, itemId: 1, quantity: 5 },
// //   { orderId: validOrderId, itemId: 5, quantity: 2 },
// // ];

// // const invalidItem: OrderItem[] = [
// //   { orderId: validOrderId, itemId: 99, quantity: 3 }, // Invalid item ID
// // ];

// // describe('OrderId is valid', () => {
// //   test('error returned for invalid orderId', async () => {
// //     const response: OrderChangeResponse = await orderChange(invalidOrderId, validOrderId, { items: validItems });
// //     expect(response.error).toBeDefined();
// //     expect(response.success).toBe(false);
// //   });

// //   test('success returned for valid orderId', async () => {
// //     const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, { items: validItems });
// //     expect(response.error).toBeUndefined();
// //     expect(response.success).toBe(true);
// //   });
// // });

// // describe('Order item updates', () => {
// //   test('quantity updates correctly for existing order item', async () => {
// //     const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, [
// //       { orderId: validOrderId, itemId: 1, quantity: 10 },
// //     ]);
// //     expect(response.success).toBe(true);
// //     expect(response.updatedItems).toContainEqual({ orderId: validOrderId, itemId: 1, quantity: 10 });
// //   });

// //   test('error returned when updating non-existent item', async () => {
// //     const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, invalidItem);
// //     expect(response.success).toBe(false);
// //     expect(response.error).toBeDefined();
// //   });

// //   test('order update fails when quantity is negative', async () => {
// //     const response: OrderChangeResponse = await orderChange(validOrderId, validOrderId, [
// //       { orderId: validOrderId, itemId: 1, quantity: -5 },
// //     ]);
// //     expect(response.success).toBe(false);
// //     expect(response.error).toBeDefined();
// //   });
// // });