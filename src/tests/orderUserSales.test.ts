
import { userRegister, reqHelper } from './testHelper';
import { SessionId, Order, UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;

import request from "sync-request-curl";

async function requestOrderUserSales(
  csv: boolean, json: boolean, pdf: boolean, userId: number
) {
  const res = request("POST", SERVER_URL + `/v1/order/${userId}/sales`, {
    qs: { csv, json, pdf },
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

let sellerId: number;
let testName: string;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

beforeEach(async () => {
  await reqHelper('DELETE', '/v1/clear');
  testName = 'Bobby Jones'

  const token = await userRegister(
    'example10@email.com', 
    'example123', 
    'Test', 
    'User').body.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
  const userId = decoded.userId;

  const sellerToken = await userRegister(
    'example20@email.com', 
    'example123', 
    'Bobby', 
    'Jones').body.token;
  sellerId = (jwt.verify(sellerToken, process.env.JWT_SECRET as string) as { userId: number }).userId;

  testSeller = {
    id: sellerId,
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

describe.skip('Order user sales send', () => {

  test('Success case', async () => {
    const response = await requestOrderUserSales(true, true, true, sellerId);
    expect(response.statusCode).toBe(200);
  });

  
});



