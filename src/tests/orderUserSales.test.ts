import { orderUserSales } from '../app'
import { UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import { getUser, getItemSellerSales } from '../dataStore';
import dotenv from 'dotenv';
dotenv.config();

import { server } from '../server';
import { createClient } from '@redis/client';

jest.mock('../dataStore', () => ({
  getUser: jest.fn(),
  getItemSellerSales: jest.fn(),
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
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem1: Item;
let testItem2: Item;
let testItem3: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

describe('Order user sales send', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    sellerId = 1;
    seller2Id = 2;
    
    // testSeller = {
    //   id: sellerId,
    //   name: 'Bobby Jones',
    //   streetName: 'Yellow St',
    //   cityName: 'Brisbane',
    //   postalZone: '4000',
    //   cbcCode: 'AU'
    // };
    // testItem1 = {
    //   id: 123,
    //   name: 'Soap',
    //   seller: testSeller,
    //   price: 5,
    //   description: 'This is soap',
    // };
    // testItem2 = {
    //   id: 124,
    //   name: 'Table',
    //   seller: testSeller,
    //   price: 80,
    //   description: 'This is a table',
    // };
    // testItem3 = {
    //   id: 125,
    //   name: 'Paper',
    //   seller: testSeller,
    //   price: 10,
    //   description: 'This is paper',
    // };
    // testBuyer = {
    //   id: 3,
    //   name: 'Test User',
    //   streetName: 'White St',
    //   cityName: 'Sydney',
    //   postalZone: '2000',
    //   cbcCode: 'AU',
    // };
    // testBillingDetails = {
    //   creditCardNumber: "1000000000000000",
    //   CVV: 111,
    //   expiryDate: date,
    // };
    // testDeliveryDetails = {
    //   streetName: 'White St',
    //   cityName: 'Sydney',
    //   postalZone: '2000',
    //   countrySubentity: 'NSW',
    //   addressLine: '33 White St, Sydney NSW',
    //   cbcCode: 'AU',
    //   startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
    //   startTime: '13:00',
    //   endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
    //   endTime: '13:00'
    // }
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
    (getUser as jest.Mock).mockResolvedValue(null);

    await expect(orderUserSales(true, true, true, sellerId + 10)).
    rejects.toThrowError('Invalid sellerId');
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid input', async () => {
    await expect(orderUserSales(false, false, false, sellerId)).
    rejects.toThrowError('At least one data option should be selected');
  });

  test('Displays no sales when order could not be created', async () => {
    (getUser as jest.Mock).mockResolvedValue({
      id: 1,
      nameFirst: 'mock',
      nameLast: 'seller',
      email: 'mockemail234@gmail.com',
      password: 'string1234',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2,
    });
    (getItemSellerSales as jest.Mock).mockResolvedValue([]);

    const response = await orderUserSales(true, true, true, sellerId);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getItemSellerSales).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ 
      sales: [], 
      CSVurl: expect.any(String), 
      PDFurl: expect.any(String),
    });
  });

  test('Sucess case with no sales, with no csv, no pdf', async () => {
    (getUser as jest.Mock).mockResolvedValue(
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
    (getItemSellerSales as jest.Mock).mockResolvedValue([]);
    const response = await orderUserSales(false, true, false, seller2Id);

    expect(response).toStrictEqual({ 
      sales: [],
    });
  });

  test('Success case with multiple sales', async () => {
    (getUser as jest.Mock).mockResolvedValue(
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
    (getItemSellerSales as jest.Mock).mockResolvedValue([
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



