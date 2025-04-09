import { orderRecommendations, orderUserSales } from '../app'
import { UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import { getUser, getItemBuyerRecommendations, getPopularItems } from '../dataStore';
import dotenv from 'dotenv';
dotenv.config();

import { server } from '../server';
import { createClient } from '@redis/client';

jest.mock('../dataStore', () => ({
  getUser: jest.fn(),
  getItemBuyerRecommendations: jest.fn(),
  getPopularItems: jest.fn(),
}));

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

let seller1Id: number,       seller2Id: number,       buyerId: number;
let testSeller1: UserSimple, testSeller2: UserSimple, testBuyer: UserSimple;
let testItem1: Item,         testItem2: Item,         testItem3: Item;
let testBillingDetails: BillingDetails, testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

describe('Tests for order recommendations', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    seller1Id = 1;
    seller2Id = 2;
    buyerId = 3;
    

    testSeller1 = {
      id: seller1Id,
      name: 'Sam Seller',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testSeller2 = {
      id: seller2Id,
      name: 'Sam Seller',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testItem1 = {
      id: 123,
      name: 'Beer-Flavoured Soap',
      seller: testSeller1,
      price: 5,
      description: 'This is soap',
    };
    testItem2 = {
      id: 124,
      name: 'Tennis Table',
      seller: testSeller2,
      price: 80,
      description: 'This is a tennis table',
    }
    testItem3 = {
      id: 124,
      name: 'Clothes Steamer',
      seller: testSeller1,
      price: 200,
      description: 'This is a clothes steamer',
    }
    testBuyer = {
      id: 3,
      name: 'Bill Buyer',
      streetName: 'White St',
      cityName: 'Sydney',
      postalZone: '2000',
      cbcCode: 'AU',
    };
    testBillingDetails = {
      creditCardNumber: "1000000000000000",
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

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from invalid limit', async () => {
    await expect(orderRecommendations(seller1Id, -1)).
    rejects.toThrowError('Limit is not a positive integer');
    await expect(orderRecommendations(seller1Id, 1.5)).
    rejects.toThrowError('Limit is not a positive integer');

    expect(getUser).toHaveBeenCalledTimes(0);
    expect(getItemBuyerRecommendations).toHaveBeenCalledTimes(0);
    expect(getPopularItems).toHaveBeenCalledTimes(0);
  });

  test('Error from invalid userId', async () => {
    (getUser as jest.Mock).mockResolvedValue(null);
    await expect(orderRecommendations(seller1Id + 10, 3)).
    rejects.toThrowError('Invalid userId');

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendations).toHaveBeenCalledTimes(0);
    expect(getPopularItems).toHaveBeenCalledTimes(0);
  });

  test('Successul recommendation with no items', async () => {
    (getUser as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendations as jest.Mock).mockResolvedValue([]);
    (getPopularItems as jest.Mock).mockResolvedValue([]);

    const response = await orderRecommendations(seller1Id, 5);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
    expect(getPopularItems).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      recommendations: [],
    });
  });

  test('Successul recommendation with enough recs, no popular items', async () => {
    (getUser as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendations as jest.Mock).mockResolvedValue([testItem1, testItem2]);

    const response = await orderRecommendations(seller1Id, 2);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
    expect(getPopularItems).toHaveBeenCalledTimes(0);
    expect(response).toStrictEqual({ 
      recommendations: [testItem1, testItem2],
    });
  });

  test('Successul recommendation with not enough recs, more popular items than needed', async () => {
    (getUser as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendations as jest.Mock).mockResolvedValue([testItem1]);
    (getPopularItems as jest.Mock).mockResolvedValue([testItem2, testItem3]);

    const response = await orderRecommendations(seller1Id, 2);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
    expect(getPopularItems).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      recommendations: [testItem1, testItem2],
    });
  });
});



