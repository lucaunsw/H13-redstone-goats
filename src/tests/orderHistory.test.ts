// import request from "sync-request-curl";
// const SERVER_URL = `http://127.0.0.1:3200`;
// const TIMEOUT_MS = 20 * 1000;
// import dotenv from 'dotenv';
// import { BillingDetailsV1, DeliveryInstructionsV1, ItemV1, OrderV1, UserV1, UserSimpleV1, status } from "../types";
// import { getUserV1, getOrdersByBuyerV1 } from "../dataStoreV1";
// import { orderHistory } from "../app";
// import { createClient } from '@redis/client';
// import { server } from '../server';
// dotenv.config();

// jest.mock('../dataStore', () => ({
//   getUserV1: jest.fn(),
//   getOrdersByBuyer: jest.fn(),
// }));

// jest.mock('@redis/client', () => ({
//   createClient: jest.fn(() => ({
//     connect: jest.fn(),
//     disconnect: jest.fn(),
//     set: jest.fn(),
//     get: jest.fn(),
//     on: jest.fn(),
//     quit: jest.fn(),
//   })),
// }));

// describe("Tests for orderCancel", () => {
//   beforeEach(async () => {
//     jest.clearAllMocks();
//   });

//   afterAll(async () => {
//     const redisClient = createClient();
//     await redisClient.quit(); 
//     server.close(); 
//   });

//   test('Error from invalid userId', async () => {
//     (getUserV1 as jest.Mock).mockResolvedValue(null);
//     await expect(orderHistory(1)).
//     rejects.toThrowError('Invalid userId');
//   });

//   test('Sucess case with no orders', async () => {
//     (getUserV1 as jest.Mock).mockResolvedValue(
//       {
//         id: 1,
//         name: "Test Buyer",
//         streetName: 'White St',
//         cityName: 'Sydney',
//         postalZone: '2000',
//         cbcCode: 'AU',
//       }
//     );
//     (getOrdersByBuyerV1 as jest.Mock).mockResolvedValue([]);
//     const response = await orderHistory(1);
//     expect(response).toStrictEqual({ 
//       successfulOrders: [],
//       cancelledOrders: [],
//     });
//   });

//   test('Sucess case with cancelled and successful orders', async () => {
//     const date = new Date().toISOString().split('T')[0];
//     const testSeller: UserSimpleV1 = {
//       id: 1,
//       name: 'Test Seller',
//       streetName: 'Yellow St',
//       cityName: 'Brisbane',
//       postalZone: '4000',
//       cbcCode: 'AU'
//     };
//     const testItem1: ItemV1 = {
//       id: 123,
//       name: 'soap',
//       seller: testSeller,
//       price: 5,
//       description: 'This is soap',
//     }
//     const testItem2: ItemV1 = {
//       id: 124,
//       name: 'table',
//       seller: testSeller,
//       price: 20,
//       description: 'This is soap',
//     }
//     const testBuyer: UserSimpleV1 = {
//       id: 1,
//       name: "Test Buyer",
//       streetName: 'White St',
//       cityName: 'Sydney',
//       postalZone: '2000',
//       cbcCode: 'AU',
//     };
//     const testBillingDetails: BillingDetailsV1 = {
//       creditCardNumber: "1000000000000000",
//       CVV: 111,
//       expiryDate: "2028-04-04",
//     };
//     const testDeliveryDetails: DeliveryInstructionsV1 = {
//       streetName: 'White St',
//       cityName: 'Sydney',
//       postalZone: '2000',
//       countrySubentity: 'NSW',
//       addressLine: '33 White St, Sydney NSW',
//       cbcCode: 'AU',
//       startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
//       startTime: '13:00',
//       endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
//       endTime: '13:00'
//     };

//     (getUserV1 as jest.Mock).mockResolvedValue(
//       {
//         id: 1,
//         name: "Test Buyer",
//         streetName: 'White St',
//         cityName: 'Sydney',
//         postalZone: '2000',
//         cbcCode: 'AU',
//       }
//     );
//     (getOrdersByBuyerV1 as jest.Mock).mockResolvedValue([
//       {
//         items: [testItem1],
//         quantities: [1],
//         buyer: testBuyer,
//         billingDetails: testBillingDetails,
//         totalPrice: 5,
//         delivery: testDeliveryDetails,
//         lastEdited: date,
//         createdAt: date,
//       },
//       {
//         items: [testItem2],
//         quantities: [1],
//         buyer: testBuyer,
//         billingDetails: testBillingDetails,
//         totalPrice: 5,
//         delivery: testDeliveryDetails,
//         lastEdited: date,
//         status: "cancelled",
//         createdAt: date,
//       }
//     ]);
//     const response = await orderHistory(1);
//     expect(response).toStrictEqual({ 
//       successfulOrders: [
//         {
//           items: [testItem1],
//           quantities: [1],
//           buyer: testBuyer,
//           billingDetails: testBillingDetails,
//           totalPrice: 5,
//           delivery: testDeliveryDetails,
//           lastEdited: date,
//           createdAt: date,
//         }
//       ],
//       cancelledOrders: [
//         {
//           items: [testItem2],
//           quantities: [1],
//           buyer: testBuyer,
//           billingDetails: testBillingDetails,
//           totalPrice: 5,
//           delivery: testDeliveryDetails,
//           lastEdited: date,
//           status: "cancelled",
//           createdAt: date,
//         }
//       ],
//     });
//   })
// });

