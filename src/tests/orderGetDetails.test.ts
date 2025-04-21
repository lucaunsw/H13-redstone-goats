import { getOrderDetails } from '../app';
import dotenv from 'dotenv';
import { server } from '../server';
import { getOrderV2  } from '../dataStoreV2';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV2', () => ({
  getOrderV2: jest.fn(),
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
    (getOrderV2 as jest.Mock).mockResolvedValueOnce(null);
    await expect(getOrderDetails(1)).rejects.toThrowError('Order could not be found');
  });

  test('Successfully returns details of the order', async () => {
    const date = new Date().toISOString().split('T')[0];
    (getOrderV2 as jest.Mock).mockResolvedValueOnce(
      {
        items: [
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
        ],
        quantities: [1],
        buyer: {
          id: 1,
          name: 'Test Buyer',
          email: 'TestBuyer1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: {
          creditCardNumber: "1000000000000000",
          CVV: 111,
          expiryDate: date,
        },
        totalPrice: 5,
        taxAmount: 40,
        taxTotal: 2,
        delivery: {
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
        },
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
    );
    const response = await getOrderDetails(1);
    expect(response).toStrictEqual(
      {
        items: [
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
        ],
        quantities: [1],
        buyer: {
          id: 1,
          name: 'Test Buyer',
          email: 'TestBuyer1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: {
          creditCardNumber: "1000000000000000",
          CVV: 111,
          expiryDate: date,
        },
        totalPrice: 5,
        taxAmount: 40,
        taxTotal: 2,
        delivery: {
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
        },
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
    );
    
  });

});