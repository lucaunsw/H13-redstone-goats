import request from "sync-request-curl";
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BillingDetails, DeliveryInstructions, Item, UserSimple } from "../types";
import { reqHelper, userRegister, requestOrderCreate} from "./testHelper";
dotenv.config();

function getPutResponse(route: string, body: { [key: string]: unknown }) {
  const res = request("PUT", SERVER_URL + route, {
    json: body,
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function getPostResponse(
  route: string,
  body: { [key: string]: unknown }
) {
  const res = request("POST", SERVER_URL + route, {
    json: body,
    timeout: TIMEOUT_MS,
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

////////////////////////////////////////////////////////////////////////////////

let userId: number;
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
      'Bobby', 
      'Jones').body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    userId = decoded.userId;
  
    const sellerToken = await userRegister(
      'example20@email.com', 
      'example123', 
      'Test', 
      'Seller').body.token;
    const sellerId = (jwt.verify(sellerToken, process.env.JWT_SECRET as string) as { userId: number }).userId;
  
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

describe("orderCancel successful return", () => {
  test("Should cancel an order successfully", async () => {
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
    const response = await requestOrderCreate(body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
    const orderId = response.body.orderId;

    const res = await getPutResponse(`/v1/${userId}/order/${orderId}/cancel`, {
      reason: "Changed my mind",
    });
    expect(res.body).toStrictEqual({ reason: "Changed my mind" });
    expect(res.statusCode).toBe(200);
  }, 15000);

  test("Unable to cancel error due to invalid userId", async () => {
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
    const response = await requestOrderCreate(body);
    const orderId = response.body.orderId;

    const res = await getPutResponse(`/v1/${userId + 1000000}/order/${orderId}/cancel`, {
      reason: "Changed my mind",
    });
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test("Unable to cancel error due to invalid orderId", async () => {
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
    const response = await requestOrderCreate(body);
    const orderId = response.body.orderId;

    const res = await getPutResponse(`/v1/${userId}/order/${orderId + 1000000}/cancel`, {
      reason: "Changed my mind",
    });
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test("Unable to cancel since order is already cancelled", async () => {
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
    const response = await requestOrderCreate(body);
    const orderId = response.body.orderId;

    await getPutResponse(`/v1/${userId}/order/${orderId}/cancel`, {
      reason: "Changed my mind",
    });
    const res = await getPutResponse(`/v1/${userId}/order/${orderId}/cancel`, {
      reason: "Changed my mind again",
    });
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });
});