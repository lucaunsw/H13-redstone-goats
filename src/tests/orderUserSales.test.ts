
import { userRegister, reqHelper, 
  requestOrderCreate, requestOrderUserSales } from './testHelper';
import { UserSimple, 
  Item, BillingDetails, DeliveryInstructions } from '../types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

let sellerId: number;
let seller2Id: number;
let testBuyer: UserSimple;
let testSeller: UserSimple;
let testItem1: Item;
let testItem2: Item;
let testBillingDetails: BillingDetails;
let testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

describe('Order user sales send', () => {

  beforeEach(async () => {
    await reqHelper('DELETE', '/v1/clear');
  
    const token = await userRegister(
      'example10@email.com', 
      'example123', 
      'Test', 
      'User').body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const userId = decoded.userId;
    
    const sellerToken = await userRegister(
      'example20@email.com', 
      'example123', 
      'Bobby', 
      'Jones').body.token;
    sellerId = (jwt.verify(sellerToken, process.env.JWT_SECRET as string) as { userId: number }).userId;
  
    const seller2Token = await userRegister(
      'example30@email.com', 
      'example123', 
      'Cake', 
      'Man').body.token;
    seller2Id = (jwt.verify(seller2Token, process.env.JWT_SECRET as string) as { userId: number }).userId;

    testSeller = {
      id: sellerId,
      name: 'Bobby Jones',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };
    testItem1 = {
      id: 123,
      name: 'Soap',
      seller: testSeller,
      price: 5,
      description: 'This is soap',
    };
    testItem2 = {
      id: 124,
      name: 'Table',
      seller: testSeller,
      price: 80,
      description: 'This is a table',
    }
    testBuyer = {
      id: userId,
      name: 'Test User',
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

  test('Error from invalid sellerId', async () => {
    const response = await requestOrderUserSales(true, true, true, sellerId + 10);
    expect(response.statusCode).toBe(401);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Error from invalid input', async () => {
    const response = await requestOrderUserSales(false, false, false, sellerId);
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Displays no sales when order could not be created', async () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem1, testItem2],
      quantities: [1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 85,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await requestOrderCreate(body);
    const response = await requestOrderUserSales(true, true, true, sellerId);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ 
      sales: [], 
      CSVurl: expect.any(String), 
      PDFurl: expect.any(String),
    });
  });

  test('Sucess case with no sales, with no csv, no pdf', async () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem1, testItem2],
      quantities: [1, 1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 85,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    requestOrderCreate(body);
    const response = await requestOrderUserSales(false, true, false, seller2Id);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ 
      sales: [],
    });
  });

  test('Success case with multiple sales', async () => {
    const date = new Date().toISOString().split('T')[0];
    const body = {
      items: [testItem1, testItem2],
      quantities: [2, 1],
      buyer: testBuyer,
      billingDetails: testBillingDetails,
      totalPrice: 90,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    }
    await requestOrderCreate(body);
    const response = await requestOrderUserSales(true, true, true, sellerId);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ 
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
        }
      ], 
      CSVurl: expect.any(String), 
      PDFurl: expect.any(String), 
    });
  });
  
});



