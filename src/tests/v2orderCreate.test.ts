import { orderCreate } from '../app';
import { UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import dotenv from 'dotenv';
import { server } from '../server';
import { addOrderXML, addOrder, getItem } from '../dataStore';
import { userExists, validItemList, addItems, generateUBL, validSellers } from '../helper';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStore', () => ({
  addOrder: jest.fn(),
  addOrderXML: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('../helper', () => ({
  userExists: jest.fn(),
  validItemList: jest.fn(),
  addItems: jest.fn(),
  generateUBL: jest.fn(),
  validSellers: jest.fn(),
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

let userId: number;
let testName: string;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

describe('Test orderCreate route', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    testName = 'Bobby Jones'
    userId = 1;
    const sellerId = 2;
    
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

  test('Error from no userId provided', async () => {
      const body = {
        items: [testItem],
        quantities: [1],
        buyer: {
          id: null,
          name: testName,
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: testBillingDetails,
        delivery: testDeliveryDetails,
        totalPrice: 5,
        createdAt: new Date(),
      };
  
      await expect(orderCreate(body)).rejects.toThrowError('No userId provided');
  });

  test('Error from invalid token', async () => {
    (userExists as jest.Mock).mockResolvedValue(false);
      const invalidUserId = userId + 1; 
      
      const body = {
        items: [testItem],
        quantities: [1],
        buyer: {
          id: invalidUserId,
          name: testName,
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: testBillingDetails,
        delivery: testDeliveryDetails,
        totalPrice: 5,
        createdAt: new Date(),
      };
  
      await expect(orderCreate(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
      expect(userExists).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid name', async () => {
    (userExists as jest.Mock).mockResolvedValue(false);
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: {
        id: userId,
        name: 'Apple Apple',
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      totalPrice: 5,
      lastEdited: date,
      createdAt: new Date(),
    };

    await expect(orderCreate(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
    expect(userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid total price', async () => {
    (userExists as jest.Mock).mockResolvedValue(true);
    (validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (validItemList as jest.Mock).mockResolvedValue(40);
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: testSeller,
        price: 40,
        description: 'This is Toothpaste',
      }],
      quantities: [1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await expect(orderCreate(body)).rejects.toThrowError('Incorrect total price provided');
    expect(userExists).toHaveBeenCalledTimes(1);
    expect(validItemList).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid seller', async () => {
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    (validSellers as jest.Mock).mockResolvedValueOnce(false); 
    (getItem as jest.Mock).mockResolvedValue(null);
  
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: {
          id: 1,
          name: 'Test Seller',
          streetName: 'Yellow St',
          cityName: 'Brisbane',
          postalZone: '4000',
          cbcCode: 'AU',
        },
        price: 5,
        description: 'This is Toothpaste',
      }],
      quantities: [1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    };
  
    await expect(orderCreate(body)).rejects.toThrowError('Invalid seller(s)');
    expect(userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from no itemId provided', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    (validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItem as jest.Mock).mockResolvedValue(null);
    
      const body = {
        items: [{
          id: null,
          name: 'Toothpaste',
          seller: testSeller,
          price: 5,
          description: 'This is Toothpaste',
        }],
        quantities: [1],
        buyer: testBuyer,
        seller: testSeller,
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        createdAt: new Date(),
      }
      await expect(orderCreate(body)).rejects.toThrowError('No item Id provided');
      expect(userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item price', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    (validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItem as jest.Mock).mockResolvedValue(null);
    
      const body = {
        items: [{
          id: 124,
          name: 'Toothpaste',
          seller: testSeller,
          price: -2,
          description: 'This is Toothpaste',
        }],
        quantities: [1],
        buyer: testBuyer,
        seller: testSeller,
        billingDetails: testBillingDetails,
        totalPrice: -2,
        delivery: testDeliveryDetails,
        lastEdited: date,
        createdAt: new Date(),
      }
      await expect(orderCreate(body)).rejects.toThrowError('Invalid item price');
      expect(userExists).toHaveBeenCalledTimes(1);
      expect(getItem).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item quantity', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    (validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItem as jest.Mock).mockResolvedValue(null);
    
      const body = {
        items: [{
          id: 124,
          name: 'Toothpaste',
          seller: testSeller,
          price: 5,
          description: 'This is Toothpaste',
        }],
        quantities: [-1],
        buyer: testBuyer,
        seller: testSeller,
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        createdAt: new Date(),
      }
      await expect(orderCreate(body)).rejects.toThrowError('Invalid quantities provided');
      expect(userExists).toHaveBeenCalledTimes(1);
      expect(getItem).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid quantity list', async () => {
    const helper = await import('../helper'); 
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    
      const body = {
        items: [{
          id: 124,
          name: 'Toothpaste',
          seller: testSeller,
          price: 5,
          description: 'This is Toothpaste',
        }],
        quantities: [1, 2],
        buyer: testBuyer,
        seller: testSeller,
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        createdAt: new Date(),
      }
      await expect(orderCreate(body)).rejects.toThrowError('Invalid amount of item quantities provided');
      expect(userExists).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid item (duplicate item ids)', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
    (userExists as jest.Mock).mockResolvedValueOnce(true);
    (validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (getItem as jest.Mock).mockResolvedValue(null);
    const body = {
      items: [{
        id: 123,
        name: 'Toothpaste',
        seller: testSeller,
        price: 5,
        description: 'This is Toothpaste',
      }, testItem],
      quantities: [1,1],
      buyer: testBuyer,
      seller: testSeller,
      billingDetails: testBillingDetails,
      totalPrice: 10,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await expect(orderCreate(body)).rejects.toThrowError('Same item Id is registered to a different item name');
    expect(userExists).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item id', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
    (userExists as jest.Mock).mockResolvedValueOnce(true); 
    (validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItem as jest.Mock).mockResolvedValue({
      id: 124,
      name: 'Rock',
      seller: testSeller,
      price: 5,
      description: 'This is a rock'
    });
    
      const body = {
        items: [{
          id: 124,
          name: 'Toothpaste',
          seller: testSeller,
          price: 5,
          description: 'This is Toothpaste',
        }],
        quantities: [1],
        buyer: testBuyer,
        seller: testSeller,
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        createdAt: new Date(),
      }
      await expect(orderCreate(body)).rejects.toThrowError('Same item Id is registered to a different item name');
      expect(userExists).toHaveBeenCalledTimes(1);
      expect(getItem).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid bank details', async () => {
    (userExists as jest.Mock).mockResolvedValue(true);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: {
        creditCardNumber: "100000000000000000",
        CVV: 111,
        expiryDate: date,
      },
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await expect(orderCreate(body)).rejects.toThrowError('Invalid bank details');
  });
  
  test('Error from invalid delivery date (start date is before current date)', async () => {
    (userExists as jest.Mock).mockResolvedValue(true);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: {
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        countrySubentity: 'NSW',
        addressLine: '33 White St, Sydney NSW',
        cbcCode: 'AU',
        startDate: new Date(2025, 0, 1).toISOString().split('T')[0],
        startTime: '13:00',
        endDate: new Date(2025, 0, 1).toISOString().split('T')[0],
        endTime: '13:00'
      },
      lastEdited: date,
      createdAt: new Date(),
    }
    await expect(orderCreate(body)).rejects.toThrowError('Invalid date selection');

  });
  
  test('Error from invalid delivery date (end date is before start date)', async () => {
    (userExists as jest.Mock).mockResolvedValue(true);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: {
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        countrySubentity: 'NSW',
        addressLine: '33 White St, Sydney NSW',
        cbcCode: 'AU',
        startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
        startTime: '13:00',
        endDate: new Date(2025, 9, 3).toISOString().split('T')[0],
        endTime: '13:00'
      },
      lastEdited: date,
      createdAt: new Date(),
    }
    await expect(orderCreate(body)).rejects.toThrowError('Invalid date selection');

  }); 

  test.each([
    -0.1,
    1.1,
  ])('Error from invalid tax amount', async (invalidTax) => {
    (userExists as jest.Mock).mockResolvedValue(true);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      taxAmount: invalidTax,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    };
  
    await expect(orderCreate(body)).rejects.toThrowError('Invalid tax amount entered');
    expect(validSellers).toHaveBeenCalledTimes(0);
  });

  test('Success case: Returns orderId', async () => {
    (userExists as jest.Mock).mockResolvedValue(true);
    (validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (validItemList as jest.Mock).mockResolvedValue(5);
    (addItems as jest.Mock).mockResolvedValue({});
    (addOrder as jest.Mock).mockResolvedValue(1);
    (generateUBL as jest.Mock).mockResolvedValueOnce('Mock UBL');
    (addOrderXML as jest.Mock).mockResolvedValue(1);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      taxAmount: 0.4,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await orderCreate(body);
    expect(addOrderXML).toHaveBeenCalledTimes(1);
  });
    
});

