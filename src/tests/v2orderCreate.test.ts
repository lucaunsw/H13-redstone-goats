import { v2orderCreate } from '../app';
import { UserSimpleV2, 
  ItemV2, BillingDetailsV1, DeliveryInstructionsV1 } from '../types';
import dotenv from 'dotenv';
import { server } from '../server';
import { addOrderXMLV1 } from '../dataStoreV1';
import { addOrderV2, getItemV2, getUserSimpleV2 } from '../dataStoreV2'
import { v2userExists, v2validItemList, v2generateUBL, v2validSellers } from '../helper';
dotenv.config();
import { createClient } from '@redis/client';

jest.mock('../dataStoreV1', () => ({
  addOrderXMLV1: jest.fn(),
}));

jest.mock('../dataStoreV2', () => ({
  addOrderV2: jest.fn(),
  getItemV2: jest.fn(),
  getUserSimpleV2: jest.fn(),
}));

jest.mock('../helper', () => ({
  v2userExists: jest.fn(),
  v2validItemList: jest.fn(),
  v2generateUBL: jest.fn(),
  v2validSellers: jest.fn(),
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
let testBuyer: UserSimpleV2;
let testSeller: UserSimpleV2;
let testItem: ItemV2;
let testBillingDetails: BillingDetailsV1;
let testDeliveryDetails: DeliveryInstructionsV1;
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
      email: 'TestSeller1@gmail.com',
      phone: '+61400000000',
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
      email: 'TestBuyer1@gmail.com',
      phone: '+61400000000',
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
          email: 'TestBuyer1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: testBillingDetails,
        delivery: testDeliveryDetails,
        totalPrice: 5,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      };
  
      await expect(v2orderCreate(body)).rejects.toThrowError('No userId provided');
  });

  test('Error from invalid token', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(false);
      const invalidUserId = userId + 1; 
      
      const body = {
        items: [testItem],
        quantities: [1],
        buyer: {
          id: invalidUserId,
          name: testName,
          email: 'TestBuyer1@gmail.com',
          phone: '+61400000000',
          streetName: 'White St',
          cityName: 'Sydney',
          postalZone: '2000',
          cbcCode: 'AU',
        },
        billingDetails: testBillingDetails,
        delivery: testDeliveryDetails,
        totalPrice: 5,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      };
  
      await expect(v2orderCreate(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
      expect(v2userExists).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid name', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(false);
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: {
        id: userId,
        name: 'Apple Apple',
        email: 'TestBuyer1@gmail.com',
        phone: '+61400000000',
        streetName: 'White St',
        cityName: 'Sydney',
        postalZone: '2000',
        cbcCode: 'AU',
      },
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      totalPrice: 5,
      lastEdited: date,
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    };

    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
    expect(v2userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid total price', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (v2validItemList as jest.Mock).mockResolvedValue(40);
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
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await expect(v2orderCreate(body)).rejects.toThrowError('Incorrect total price provided');
    expect(v2userExists).toHaveBeenCalledTimes(1);
    expect(v2validItemList).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid seller', async () => {
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    (v2validSellers as jest.Mock).mockResolvedValueOnce(false); 
    (getItemV2 as jest.Mock).mockResolvedValue(null);
  
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: {
          id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000',
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
      billingDetails: testBillingDetails,
      totalPrice: 5,
      delivery: testDeliveryDetails,
      lastEdited: date,
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    };
  
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid seller(s)');
    expect(v2userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid seller phone number', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true); 
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validSellers').mockImplementation(jest.requireActual('../helper').v2validSellers);
    (getUserSimpleV2 as jest.Mock)
      .mockResolvedValue({
        id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000',
          streetName: 'Yellow St',
          cityName: 'Brisbane',
          postalZone: '4000',
          cbcCode: 'AU'
      });
    // (v2validSellers as jest.Mock).mockResolvedValueOnce(); 
    
    const body = {
      items: [{
        id: 124,
        name: 'Toothpaste',
        seller: {
          id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000',
          streetName: 'Yellow St',
          cityName: 'Brisbane',
          postalZone: '4000',
          cbcCode: 'AU',
        },
        price: 5,
        description: 'This is Toothpaste',
      },
      {
        id: 125,
        name: 'Globe',
        seller: {
          id: 1,
          name: 'Test Seller',
          email: 'TestSeller1@gmail.com',
          phone: '+61400000000000000',
          streetName: 'Yellow St',
          cityName: 'Brisbane',
          postalZone: '4000',
          cbcCode: 'AU',
        },
        price: 20,
        description: 'This is a globe',
      }],
      quantities: [1, 1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 25,
      delivery: testDeliveryDetails,
      lastEdited: date,
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    };
  
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid seller phone number');
    expect(v2userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from no itemId provided', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validItemList').mockImplementation(jest.requireActual('../helper').v2validItemList);
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true);
    
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
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
      await expect(v2orderCreate(body)).rejects.toThrowError('No item Id provided');
      expect(v2userExists).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item price', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validItemList').mockImplementation(jest.requireActual('../helper').v2validItemList);
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItemV2 as jest.Mock).mockResolvedValue({
      id: 124,
      name: 'Toothpaste',
      seller: testSeller,
      price: -2,
      description: 'This is Toothpaste'
    });
    
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
        billingDetails: testBillingDetails,
        totalPrice: -2,
        delivery: testDeliveryDetails,
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
      await expect(v2orderCreate(body)).rejects.toThrowError('Invalid item price');
      expect(v2userExists).toHaveBeenCalledTimes(1);
      expect(getItemV2).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item quantity', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validItemList').mockImplementation(jest.requireActual('../helper').v2validItemList);
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItemV2 as jest.Mock).mockResolvedValue({
      id: 124,
      name: 'Toothpaste',
      seller: testSeller,
      price: 5,
      description: 'This is Toothpaste'
    });
    
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
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
      await expect(v2orderCreate(body)).rejects.toThrowError('Invalid quantities provided');
      expect(v2userExists).toHaveBeenCalledTimes(1);
      expect(getItemV2).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid quantity list', async () => {
    const helper = await import('../helper'); 
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    
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
        billingDetails: testBillingDetails,
        totalPrice: 5,
        delivery: testDeliveryDetails,
        lastEdited: date,
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
      await expect(v2orderCreate(body)).rejects.toThrowError('Invalid amount of item quantities provided');
      expect(v2userExists).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid item (duplicate item ids)', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validItemList').mockImplementation(jest.requireActual('../helper').v2validItemList);
    (v2userExists as jest.Mock).mockResolvedValueOnce(true);
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (getItemV2 as jest.Mock)
      .mockResolvedValueOnce({
        id: 124,
        name: 'Toothpaste',
        seller: testSeller,
        price: 5,
        description: 'This is Toothpaste'
      })
      .mockResolvedValueOnce(testItem);
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
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await expect(v2orderCreate(body)).rejects.toThrowError('Same item Id is registered to a different item name');
    expect(v2userExists).toHaveBeenCalledTimes(1);
    expect(getItemV2).toHaveBeenCalledTimes(1);
  });

  test('Error from invalid item id', async () => {
    const helper = await import('../helper'); 
    jest.spyOn(helper, 'v2validItemList').mockImplementation(jest.requireActual('../helper').v2validItemList);
    (v2userExists as jest.Mock).mockResolvedValueOnce(true); 
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true);
    (getItemV2 as jest.Mock).mockResolvedValue({
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
        currency: 'AUD',
        paymentAccountId: '123456',
        paymentAccountName: 'payName',
        financialInstitutionBranchId: 'WPACAU2S',
        createdAt: new Date(),
      }
      await expect(v2orderCreate(body)).rejects.toThrowError('Same item Id as Toothpaste is registered to a different item name');
      expect(v2userExists).toHaveBeenCalledTimes(1);
      expect(getItemV2).toHaveBeenCalledTimes(1);
  });
  
  test('Error from invalid bank details', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
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
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid bank details');
  });
  
  test('Error from invalid delivery date (start date is before current date)', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
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
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid date selection');

  });
  
  test('Error from invalid delivery date (end date is before start date)', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
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
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid date selection');

  }); 

  test.each([
    -0.1,
    101,
  ])('Error from invalid tax amount', async (invalidTax) => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
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
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    };
  
    await expect(v2orderCreate(body)).rejects.toThrowError('Invalid tax amount entered');
    expect(v2validSellers).toHaveBeenCalledTimes(0);
  });

  test('Success case: Returns orderId', async () => {
    (v2userExists as jest.Mock).mockResolvedValue(true);
    (v2validSellers as jest.Mock).mockResolvedValueOnce(true); 
    (v2validItemList as jest.Mock).mockResolvedValue(5);
    (addOrderV2 as jest.Mock).mockResolvedValue(1);
    (v2generateUBL as jest.Mock).mockResolvedValueOnce('Mock UBL');
    (addOrderXMLV1 as jest.Mock).mockResolvedValue(1);
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 5,
      taxAmount: 40,
      taxTotal: 2,
      delivery: testDeliveryDetails,
      lastEdited: date,
      currency: 'AUD',
      paymentAccountId: '123456',
      paymentAccountName: 'payName',
      financialInstitutionBranchId: 'WPACAU2S',
      createdAt: new Date(),
    }
    await v2orderCreate(body);
    expect(addOrderXMLV1).toHaveBeenCalledTimes(1);
  });
    
});

