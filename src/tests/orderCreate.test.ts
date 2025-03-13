import { userRegister, reqHelper } from './testHelper';
import { SessionId, OrderParam, UserParam, 
  Item, BillingDetailsParam, DeliveryInstructions } from '../types';
import { getPostResponse } from '../wrapper';

const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;

import request from "sync-request-curl";

function requestOrderCreate(
  body: OrderParam,
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

// let user: {body: { token: SessionId }};
let userId: number;
let testName: string;
let testUser: UserParam;
let testSeller: UserParam;
let testItem: Item;
let testBillingDetails: BillingDetailsParam;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

beforeEach(() => {
  reqHelper('DELETE', '/v1/clear');
  testName = 'Bobby Jones'
  userId = userRegister(
    'BobbyJones@gmail.com',
    'cake',
    'Bobby',
    'Jones}');
    
  testItem = {
    id: 123,
    name: 'soap',
    price: 5,
    description: 'This is soap',
  };
  testUser = {
    userId: userId,
    name: testName,
    streetName: 'White St',
    cityName: 'Sydney',
    postalZone: '2000',
    cbcCode: 'AU',
  };
  testSeller = {
    userId: 1,
    name: 'Test Seller',
    streetName: 'Yellow St',
    cityName: 'Brisbane',
    postalZone: '4000',
    cbcCode: 'AU'
  };
  testBillingDetails = {
    creditCardNumber: 1000000000000000,
    CVV: 111,
    expiryDate: date,
  };
  testDeliveryDetails = {
    streetName: 'White St',
    citName: 'Sydney',
    postalZone: '2000',
    countrySubentity: 'NSW',
    addressLine: '33 White St, Sydney NSW',
    cbcCode: 'AU',
    startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
    startTime: '13:00',
    endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
    endTime: '13:00'
  }
});


describe.skip('Test orderCreate route', () => {

  test('Error from invalid token', () => {
    const invalidUserId = userId + 1; 
    
    const body = {
      items: [testItem],
      user: {
        userId: invalidUserId,
        name: testName,
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      seller: testSeller,
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      lastEdited: date,
    };

    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(401);
  });

  test('Error from invalid name', () => {
    
    const body = {
      items: [testItem],
      user: {
        userId: userId,
        name: 'Apple Apple',
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      seller: testSeller,
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      lastEdited: date,
    };

    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(401);
  });

  test.skip('Error from invalid item', () => {

  })

  test('Error from invalid bank details', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      user: testUser,
      seller: testSeller,
      billingDetails: {
        creditCardNumber: 100000000000,
        CVV: 111,
        expiryDate: date,
      },
      delivery: testDeliveryDetails,
      lastEdited: date,
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
  })

  test('Success case: Returns orderId', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      user: testUser,
      seller: testSeller,
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      lastEdited: date,
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
  });

  
});