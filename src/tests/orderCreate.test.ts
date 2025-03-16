import { userRegister, reqHelper } from './testHelper';
import { SessionId, Order, UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import { getPostResponse } from '../wrapper';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

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

let userId: number;
let testName: string;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

beforeEach(async () => {
  reqHelper('DELETE', '/v1/clear');
  testName = 'Bobby Jones'

  const token = await userRegister(
    'BobbyJones@gmail.com',
    'cake',
    'Bobby',
    'Jones}').body.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
  userId = decoded.userId;
    
  testSeller = {
    id: 1,
    name: 'Test Seller',
    streetName: 'Yellow St',
    cityName: 'Brisbane',
    postalZone: '4000',
    cbcCode: 'AU'
  };
  testItem = {
    id: 123,
    name: 'soap',
    seller: testSeller,
    price: 5,
    description: 'This is soap',
  };
  testBuyer = {
    id: userId,
    name: testName,
    streetName: 'White St',
    cityName: 'Sydney',
    postalZone: '2000',
    cbcCode: 'AU',
  };
  testBillingDetails = {
    creditCardNumber: 1000000000000000,
    CVV: 111,
    expiryDate: date,
  };
  testDeliveryDetails = {
    streetName: 'White St',
    cityName: 'Sydney',
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
      quantities: [1],
      buyer: {
        userId: invalidUserId,
        name: testName,
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      totalPrice: 5,
      createdAt: new Date(),
    };

    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(401);
  });

  test('Error from invalid name', () => {
    
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: {
        userId: userId,
        name: 'Apple Apple',
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      totalPrice: 5,
      lastEdited: date,
      createdAt: new Date(),
    };

    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(401);
  });

  test('Error from invalid total price', () => {
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: testSeller,
        price: 40,
        description: 'This is Toothpaste',
      }],
      quantities: [1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid item', () => {
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: testSeller,
        price: -2,
        description: 'This is Toothpaste',
      }],
      quantities: [1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: -2,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid item (duplicate item ids)', () => {
    const body = {
      items: [{
        id: 123,
        name: 'Toothpaste',
        seller: testSeller,
        price: -2,
        description: 'This is Toothpaste',
      }, testItem],
      quantities: [1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: -2,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid bank details', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: {
        creditCardNumber: 100000000000,
        CVV: 111,
        expiryDate: date,
      },
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid delivery date (start date is before current date)', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: {
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        countrySubentity: 'NSW',
        addressLine: '33 White St, Sydney NSW',
        cbcCode: 'AU',
        startDate: new Date(2025, 0, 1).toISOString().split('T')[0],
        startTime: '13:00',
        endDate: new Date(2025, 0, 1).toISOString().split('T')[0],
        endTime: '13:00'
      },
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid delivery date (end date is before start date)', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: {
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        countrySubentity: 'NSW',
        addressLine: '33 White St, Sydney NSW',
        cbcCode: 'AU',
        startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
        startTime: '13:00',
        endDate: new Date(2025, 9, 3).toISOString().split('T')[0],
        endTime: '13:00'
      },
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Success case: Returns orderId', () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    const response = requestOrderCreate(body);

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
  });

  
});