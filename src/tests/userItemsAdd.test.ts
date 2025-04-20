import { userItemAdd } from '../app';
import { UserSimpleV2, ItemV2,} from '../types';
import dotenv from 'dotenv';
import { server } from '../server';
import { getItemV2, addItemV2, getUserSimpleV2  } from '../dataStoreV2';
import { v1validItems, v2userExists, v2validSellers } from '../helper';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV2', () => ({
  getItemV2: jest.fn(),
  addItemV2: jest.fn(),
  getUserSimpleV2: jest.fn(),
}));

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
let testSeller1: UserSimpleV2;
let testInvalidSeller1: UserSimpleV2;
let testInvalidSeller2: UserSimpleV2;

describe('Test orderCreate route', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
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
    testInvalidSeller1 = {
      id: 1,
      name: 'Test Seller',
      email: 'TestSeller1@gmail.com',
      phone: '+614000000000000',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testInvalidSeller2 = {
      id: null,
      name: 'Test Seller',
      email: 'TestSeller1@gmail.com',
      phone: '+614000000',
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
    }
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from item already exists', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v1validItems').mockImplementation(jest.requireActual('../helper').v1validItems);
    (getItemV2 as jest.Mock).mockResolvedValueOnce(testItem1);

    const body = [testItem1];
    await expect(userItemAdd(body)).rejects.toThrowError('Same item Id is already registered to a different item name');
    expect(getItemV2).toHaveBeenCalledTimes(1);
  });

  test('Error from no item id provided', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v1validItems').mockImplementation(jest.requireActual('../helper').v1validItems);

    const body = [{
      id: null,
      name: 'soap',
      seller: testSeller1,
      price: 5,
      description: 'This is soap',
    }];
    await expect(userItemAdd(body)).rejects.toThrowError('No item Id provided');
    expect(getItemV2).toHaveBeenCalledTimes(0);
  });

  test('Error from duplicate item ids provided', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v1validItems').mockImplementation(jest.requireActual('../helper').v1validItems);

    const body = [testItem1, testItem1];
    await expect(userItemAdd(body)).rejects.toThrowError('Same item Id is registered to a different item name, or same item was entered more than once');
    expect(v2userExists).toHaveBeenCalledTimes(0);
  });

  test('Error from invalid item price', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v1validItems').mockImplementation(jest.requireActual('../helper').v1validItems);
    (getItemV2 as jest.Mock).mockResolvedValue(null);

    const body = [{
      id: 123,
      name: 'soap',
      seller: testSeller1,
      price: -1,
      description: 'This is soap',
    }];
    await expect(userItemAdd(body)).rejects.toThrowError('Invalid item price');
    expect(v2userExists).toHaveBeenCalledTimes(0);
  });

  test('Error from invalid items', async () => {
    (v1validItems as jest.Mock).mockResolvedValue(false);

    const body = [testItem1];
    await expect(userItemAdd(body)).rejects.toThrowError('Items could not be added');
    expect(v2userExists).toHaveBeenCalledTimes(0);
  });
  
  test('Error from invalid seller id', async () => {
    (v1validItems as jest.Mock).mockResolvedValue(true);
    (v2userExists as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const body = [testItem1, testItem1];
    await expect(userItemAdd(body)).rejects.toThrowError('Invalid sellerId or a different name is registered to sellerId');
    expect(v2userExists).toHaveBeenCalledTimes(2);
  });

  test('Error from no sellerId provided', async () => {
    (v1validItems as jest.Mock).mockResolvedValue(true);

    const body = [{
      id: 123,
      name: 'soap',
      seller: testInvalidSeller1,
      price: 5,
      description: 'This is soap',
    }];
    await expect(userItemAdd(body)).rejects.toThrowError('Invalid seller phone number');
    expect(v2userExists).toHaveBeenCalledTimes(0);
  });

  test('Error from invalid seller phone', async () => {
    (v1validItems as jest.Mock).mockResolvedValue(true);

    const body = [{
      id: 123,
      name: 'soap',
      seller: testInvalidSeller2,
      price: 5,
      description: 'This is soap',
    }];
    await expect(userItemAdd(body)).rejects.toThrowError('No seller Id provided');
    expect(v2userExists).toHaveBeenCalledTimes(0);
  });

  test('Successfully adds items', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2addItems').mockImplementation(jest.requireActual('../helper').v2addItems);
    jest.spyOn(helper, 'v1validItems').mockImplementation(jest.requireActual('../helper').v1validItems);
    (v2userExists as jest.Mock).mockResolvedValue(true);
    (addItemV2 as jest.Mock)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);
    const body = [testItem1, {
      id: 124,
      name: 'table',
      seller: testSeller1,
      price: 20,
      description: 'This is a table',
    }];
    await userItemAdd(body);
    expect(addItemV2).toHaveBeenCalledTimes(2);
  });
  
});