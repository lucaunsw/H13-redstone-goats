import { userRegister } from './testHelper';
import { SessionId, Order, User, 
  Item, BillingDetails } from '../types';
import { getPostResponse } from '../wrapper';

const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;

import request from "sync-request-curl";

function requestOrderCreate(
  body: Order,
) {
  const res = request("POST", SERVER_URL + `/v1/order/create`, {
    json: body,
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

  test.skip('Temp test', () => {
    const number = 1;
    expect(number).toBe(1);
  });

// let user: {body: { token: SessionId }};
// let userId: number;
// let name: string;
// let user: User;
// let testItem: Item;
// let testBillingDetails: BillingDetails;
// const date = new Date().toISOString().split('T')[0];;

// beforeEach(() => {
//   // clear function
//   name = 'Bobby Jones'
//   userId = userRegister(
// 	  'BobbyJones@gmail.com',
// 	  'cake',
// 	  'Bobby',
// 	  'Jones}');

//   user = {
//     userId: userId,
//     name: name,
//   };
//   testItem = {
//     id: 123,
//     name: 'soap',
//     price: 5,
//     description: 'This is soap',
//   };
//   testBillingDetails = {
//     creditCardNumber: 1000000000000000,
//     CVV: 111,
//     expiryDate: date,
//   };
// });


// describe.skip('Test orderCreate route', () => {

//   test('Error from invalid token', () => {
//     const invalidUserId = userId + 1; 
    
//     const body = {
//       items: [testItem],
//       user: {
//         userId: invalidUserId,
//         name: name,
//       },
//       billingDetails: testBillingDetails,
//       deliveryInstructions: 'Leave at front door.',
//       lastEdited: date,
//     };

//     const response = requestOrderCreate(body);

//     expect(response.statusCode).toBe(401);
//   });

//   test('Error from invalid name', () => {
    
//     const body = {
//       items: [testItem],
//       user: {
//         userId: userId,
//         name: 'Apple Apple',
//       },
//       billingDetails: testBillingDetails,
//       deliveryInstructions: 'Leave at front door.',
//       lastEdited: date,
//     };

//     const response = requestOrderCreate(body);

//     expect(response.statusCode).toBe(401);
//   });

//   test.skip('Error from invalid item', () => {

//   })

//   test('Error from invalid bank details', () => {
//     const date = new Date().toISOString().split('T')[0];
//     const body = {
//       items: [testItem],
//       user: user,
//       billingDetails: {
//         creditCardNumber: 100000000000,
//         CVV: 111,
//         expiryDate: date,
//       },
//       deliveryInstructions: 'Leave at front door.',
//       lastEdited: date,
//     }
//     const response = requestOrderCreate(body);

//     expect(response.statusCode).toBe(400);
//     expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
//   })

//   test('Success case: Returns orderId', () => {
//     const date = new Date().toISOString().split('T')[0];
//     const body = {
//       items: [testItem],
//       user: user,
//       billingDetails: testBillingDetails,
//       deliveryInstructions: 'Leave at front door.',
//       lastEdited: date,
//     }
//     const response = requestOrderCreate(body);

//     expect(response.statusCode).toBe(201);
//     expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
//   });

  
// });