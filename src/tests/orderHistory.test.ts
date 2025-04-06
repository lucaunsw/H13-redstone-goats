import request from "sync-request-curl";
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
import dotenv from 'dotenv';
import { BillingDetails, DeliveryInstructions, Item, Order, status, User, UserSimple } from "../types";
import { getOrder, getUser, updateOrder } from "../dataStore";
import { orderHistory } from "../app";
import { createClient } from '@redis/client';
import { server } from '../server';
dotenv.config();

jest.mock('@redis/client', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  })),
}));

describe("Tests for orderCancel", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from invalid userId', async () => {
    await expect(orderHistory()).
    rejects.toThrowError('Invalid userId');
  });

  test('Sucess case with no orders', async () => {
    const response = await expect(orderHistory());
    expect(response).toStrictEqual({ 
      successfulOrders: [],
      cancelledOrders: [],
    });
  });

  test('Sucess case with cancelled and successful orders', async () => {

    const testSeller: UserSimple = {
      id: 1,
      name: 'Test Seller',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    const testItem1: Item = {
      id: 123,
      name: 'soap',
      seller: testSeller,
      price: 5,
      description: 'This is soap',
    }
    const testItem2: Item = {
      id: 124,
      name: 'table',
      seller: testSeller,
      price: 20,
      description: 'This is soap',
    }
    const testBuyer: UserSimple = {
      id: 1,
      name: "Test Buyer",
      streetName: 'White St',
      cityName: 'Sydney',
      postalZone: '2000',
      cbcCode: 'AU',
    };
    const testBillingDetails: BillingDetails = {
      creditCardNumber: "1000000000000000",
      CVV: 111,
      expiryDate: "2028-04-04",
    };
    const testDeliveryDetails: DeliveryInstructions = {
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
    const response = await expect(orderHistory());
    expect(response).toStrictEqual({ 
      successfulOrders: [],
      cancelledOrders: [],
    });
  })
});


