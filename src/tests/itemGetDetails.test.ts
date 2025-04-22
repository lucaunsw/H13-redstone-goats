import { getItemDetails } from '../app';
import dotenv from 'dotenv';
import { server } from '../server';
import { getItemV2  } from '../dataStoreV2';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV2', () => ({
  getItemV2: jest.fn(),
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

describe('Test orderCreate route', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from invalid orderId entered', async () => {
    (getItemV2 as jest.Mock).mockResolvedValueOnce(null);
    await expect(getItemDetails(1)).rejects.toThrowError('Item could not be found');
  });

  test('Successfully returns details of the order', async () => {
    const date = new Date().toISOString().split('T')[0];
    (getItemV2 as jest.Mock).mockResolvedValueOnce(
      {
        id: 123,
        name: 'soap',
        seller: {
          id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        price: 5,
        description: 'This is soap',
      }
    );
    const response = await getItemDetails(1);
    expect(response).toStrictEqual(
      {
        id: 123,
        name: 'soap',
        seller: {
          id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        price: 5,
        description: 'This is soap',
      }
    );
    
  });

});