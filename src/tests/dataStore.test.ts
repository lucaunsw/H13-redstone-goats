// import { userRegister, reqHelper, requestOrderCreate } from './testHelper';
import { UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import dotenv from 'dotenv';
import { addUser } from '../dataStore';
import { userExists, validItemList, addItems, generateUBL, validSellers } from '../helper';
dotenv.config();
import { createClient } from '@redis/client';

let userId: number;
let testName: string;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];
/*
describe('Test dataStore helpers', () => {
  beforeAll(async () => {
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

  test('Using every add/get/update/delete', async () => {
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
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await orderCreate(body);
    expect(addOrderXML).toHaveBeenCalledTimes(1);
  });
    
});
*/
