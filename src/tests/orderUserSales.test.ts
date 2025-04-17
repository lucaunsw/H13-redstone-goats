import { orderUserSales } from '../app'
import { UserSimpleV1, 
  ItemV1, BillingDetailsV1, DeliveryInstructionsV1 } from '../types';
import { getUserV1, getItemSellerSalesV1 } from '../dataStoreV1';
import dotenv from 'dotenv';
dotenv.config();

import { server } from '../server';
import { createClient } from '@redis/client';

jest.mock('../dataStoreV1', () => ({
  getUserV1: jest.fn(),
  getItemSellerSalesV1: jest.fn(),
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

let sellerId: number;
let seller2Id: number;
let testBuyer: UserSimpleV1;
let testSeller: UserSimpleV1;
let testItem1: ItemV1;
let testItem2: ItemV1;
let testItem3: ItemV1;
let testBillingDetails: BillingDetailsV1;
let testDeliveryDetails: DeliveryInstructionsV1;
const date = new Date().toISOString().split('T')[0];

describe('Order user sales send', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    sellerId = 1;
    seller2Id = 2;
  });

  afterAll(async () => {
    const redisClient = createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Error from no sellerId provided', async () => {
    await expect(orderUserSales(true, true, true, null)).
    rejects.toThrowError('No sellerId provided');
  });

  test('Error from invalid sellerId', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue(null);

    await expect(orderUserSales(true, true, true, sellerId + 10)).
    rejects.toThrowError('Invalid sellerId');
    expect(getUserV1).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid input', async () => {
    await expect(orderUserSales(false, false, false, sellerId)).
    rejects.toThrowError('At least one data option should be selected');
  });

  test('Displays no sales when order could not be created', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'seller',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemSellerSalesV1 as jest.Mock).mockResolvedValue([]);

    const response = await orderUserSales(true, true, true, sellerId);
    expect(getUserV1).toHaveBeenCalledTimes(1);
    expect(getItemSellerSalesV1).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      sales: [], 
      CSVurl: expect.any(String), 
      PDFurl: expect.any(String),
    });
  });

  test('Sucess case with no sales, with no csv, no pdf', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue(
      {
        id: 1,
        nameFirst: 'mock',
        nameLast: 'seller',
        email: 'mockemail234@gmail.com',
        password: 'string1234',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 2,
      }
    );
    (getItemSellerSalesV1 as jest.Mock).mockResolvedValue([]);
    const response = await orderUserSales(false, true, false, seller2Id);

    expect(response).toStrictEqual({ 
      sales: [],
    });
  });

  test('Success case with multiple sales', async () => {
    (getUserV1 as jest.Mock).mockResolvedValue(
      {
        id: 1,
        nameFirst: 'mock',
        nameLast: 'seller',
        email: 'mockemail234@gmail.com',
        password: 'string1234',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 2,
      }
    );
    (getItemSellerSalesV1 as jest.Mock).mockResolvedValue([
      {
        id: 123,
        name: 'Soap',
        description: 'This is soap',
        price: 5,
        amountSold: 2,
      }, 
      {
        id: 124,
        name: 'Table',
        description: 'This is a table',
        price: 80,
        amountSold: 1,
      },
      {
        id: 125,
        name: 'Paper',
        description: 'This is paper',
        price: 10,
        amountSold: 4,
      },
    ]);
    const response = await orderUserSales(true, true, true, 2);
    expect(response).toStrictEqual({ 
      sales: [
        {
          id: 123,
          name: 'Soap',
          description: 'This is soap',
          price: 5,
          amountSold: 2,
        }, 
        {
          id: 124,
          name: 'Table',
          description: 'This is a table',
          price: 80,
          amountSold: 1,
        },
        {
          id: 125,
          name: 'Paper',
          description: 'This is paper',
          price: 10,
          amountSold: 4,
        }
      ], 
      CSVurl: expect.any(String), 
      PDFurl: expect.any(String), 
    });
  });
  
});



