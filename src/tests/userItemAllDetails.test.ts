import { getAllItemDetails } from '../app';
import { UserSimpleV2, ItemV2,} from '../types';
import dotenv from 'dotenv';
import { server } from '../server';
import { getItemV2, addItemV2, getUserSimpleV2  } from '../dataStoreV2';
import { getAllUsersV1, getItemsBySellerV1  } from '../dataStoreV1';
import { v1validItems, v2userExists, v2validSellers } from '../helper';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV2', () => ({
  getUserSimpleV2: jest.fn(),
}));

jest.mock('../datastoreV1', () => ({
  getAllUsersV1: jest.fn(),
  getItemsBySellerV1: jest.fn(),
}))

jest.mock('../helper', () => ({
  v1validItems: jest.fn(),
  v2userExists: jest.fn(),
  v2addItems: jest.fn(),
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

let testItem1: ItemV2;
let testItem2: ItemV2;
let testItem3: ItemV2;
let testItem4: ItemV2;
let testSeller1: UserSimpleV2;
let testSeller2: UserSimpleV2;
let user: number;

describe('Test orderCreate route', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    user = 1;
    testSeller1 = {
      id: 1,
      name: 'Test Seller',
      email: 'TestSeller1@gmail.com',
      phone: '+61400000000',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testSeller2 = {
      id: 1,
      name: 'Test Seller2',
      email: 'TestSeller2@gmail.com',
      phone: '+61410000000',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testItem1 = {
      id: 123,
      name: 'soap',
      seller: testSeller1,
      price: 5,
      description: 'This is soap',
    };
    testItem2 = {
      id: 124,
      name: 'table',
      seller: testSeller1,
      price: 5,
      description: 'This is a table',
    };
    testItem3 = {
      id: 125,
      name: 'bed',
      seller: testSeller2,
      price: 50,
      description: 'This is a bed',
    };
    testItem4 = {
      id: 126,
      name: 'pot',
      seller: testSeller2,
      price: 9,
      description: 'This is a pot',
    };
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from invalid userId', async () => {
    (getUserSimpleV2 as jest.Mock).mockResolvedValueOnce(null);
    await expect(getAllItemDetails(2)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
  });

  test('Successfully retrieves all items', async () => {
    (getUserSimpleV2 as jest.Mock)
      .mockResolvedValueOnce(testSeller1)
      .mockResolvedValueOnce(testSeller1)
      .mockResolvedValueOnce(testSeller2);
    (getAllUsersV1 as jest.Mock).mockResolvedValue(
      [testSeller1, testSeller2]
    );
    (getItemsBySellerV1 as jest.Mock)
      .mockResolvedValueOnce(
        [testItem1, testItem2]
      )
      .mockResolvedValueOnce(
        [testItem3, testItem4]
      );

    await getAllItemDetails(1);
    expect(getItemsBySellerV1).toHaveBeenCalledTimes(2);
  });
  
});