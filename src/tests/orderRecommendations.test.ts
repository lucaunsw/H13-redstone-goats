import { orderRecommendations, orderUserSales } from '../app'
import { UserSimpleV1, 
  ItemV1, BillingDetailsV1, DeliveryInstructionsV1 } from '../types';
import { getUserV1, getItemBuyerRecommendationsV1, getPopularItemsV1 } from '../dataStoreV1';
import dotenv from 'dotenv';
dotenv.config();

import { server } from '../server';
import { createClient } from '@redis/client';

jest.mock('../dataStoreV1', () => ({
  getUserV1: jest.fn(),
  getItemBuyerRecommendationsV1: jest.fn(),
  getPopularItemsV1: jest.fn(),
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
let testSeller1: UserSimpleV1, testSeller2: UserSimpleV1, testBuyer: UserSimpleV1;
let testItem1: ItemV1,         testItem2: ItemV1,         testItem3: ItemV1;
let testBillingDetails: BillingDetailsV1, testDeliveryDetails: DeliveryInstructionsV1;
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

    expect(getUserV1).toHaveBeenCalledTimes(0);
    expect(getItemBuyerRecommendationsV1).toHaveBeenCalledTimes(0);
    expect(getPopularItemsV1).toHaveBeenCalledTimes(0);
  });

  test('Error from invalid userId', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue(null);
    await expect(orderRecommendations(seller1Id + 10, 3)).
    rejects.toThrowError('Invalid userId');

    expect(getUserV1).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendationsV1).toHaveBeenCalledTimes(0);
    expect(getPopularItemsV1).toHaveBeenCalledTimes(0);
  });

  test('Successul recommendation with no items', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendationsV1 as jest.Mock).mockResolvedValue([]);
    (getPopularItemsV1 as jest.Mock).mockResolvedValue([]);

    const response = await orderRecommendations(seller1Id, 5);
    expect(getUserV1).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendationsV1).toHaveBeenCalledTimes(1);
    expect(getPopularItemsV1).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      recommendations: [],
    });
  });

  test('Successul recommendation with enough recs, no popular items', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendationsV1 as jest.Mock).mockResolvedValue([testItem1, testItem2]);

    const response = await orderRecommendations(seller1Id, 2);
    expect(getUserV1).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendationsV1).toHaveBeenCalledTimes(1);
    expect(getPopularItemsV1).toHaveBeenCalledTimes(0);
    expect(response).toStrictEqual({ 
      recommendations: [testItem1, testItem2],
    });
  });

  test('Successul recommendation with not enough recs, more popular items than needed', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'buyer',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemBuyerRecommendationsV1 as jest.Mock).mockResolvedValue([testItem1]);
    (getPopularItemsV1 as jest.Mock).mockResolvedValue([testItem2, testItem3]);

    const response = await orderRecommendations(seller1Id, 2);
    expect(getUserV1).toHaveBeenCalledTimes(1);
    expect(getItemBuyerRecommendationsV1).toHaveBeenCalledTimes(1);
    expect(getPopularItemsV1).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      recommendations: [testItem1, testItem2],
    });
  });
});



