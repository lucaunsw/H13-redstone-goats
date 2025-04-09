import request from "sync-request-curl";
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
import dotenv from 'dotenv';
import { BillingDetails, DeliveryInstructions, Item, Order, status, UserSimple } from "../types";
import { getOrder, getOrderXML, getUser, updateOrder } from "../dataStore";
import { orderConfirm } from "../app";
dotenv.config();

export function getPostResponse(
    route: string,
    body: { [key: string]: unknown }
  ) {
    const res = request("POST", SERVER_URL + route, {
      json: body,
      timeout: TIMEOUT_MS,
    });

    return {
      body: JSON.parse(res.body.toString()),
      statusCode: res.statusCode,
    };
  }

  jest.mock('../dataStore', () => ({
    getUser: jest.fn(),
    getOrder: jest.fn(),
    updateOrder: jest.fn(),
    addOrder: jest.fn(),
    addOrderXML: jest.fn(),
    getOrderXML: jest.fn(),
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

  ////////////////////////////////////////////////////////////////////////////////
  
  let userId: number;
  let testName: string;
  let testBuyer: UserSimple;
  let testSeller: UserSimple;
  let testItem: Item;
  let testBillingDetails: BillingDetails;
  let testDeliveryDetails: DeliveryInstructions;
  const date = new Date().toISOString().split('T')[0];
  
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

  describe("Tests for orderConfirm", () => {
    test("Should confirm an order successfully", async () => {
      const mockOrder: Order = {
        id: testBuyer.id,
        items: [testItem], 
        quantities: [2], 
        buyer: testBuyer, 
        billingDetails: testBillingDetails, 
        delivery: testDeliveryDetails, 
        lastEdited: new Date().toISOString(), 
        status: status.PENDING, 
        totalPrice: testItem.price * 2, 
        createdAt: new Date(), 
        orderXMLId: 789, 
      };
      const orderId = mockOrder.id; 
    
      (getUser as jest.Mock).mockResolvedValue(orderId);
      (getOrder as jest.Mock).mockResolvedValue(mockOrder); 
      (updateOrder as jest.Mock).mockResolvedValue(true);
      (getOrderXML as jest.Mock).mockResolvedValue('Example XML');
    
      const result = await orderConfirm(userId, Number(orderId));
    
      expect(result).toStrictEqual({ UBL: expect.any(String) });
      expect(getOrder).toHaveBeenCalledWith(orderId); 
    });

    test("Should return 401 for invalid orderId", async () => {
      const mockOrder: Order = {
        id: testBuyer.id,
        items: [testItem], 
        quantities: [2], 
        buyer: testBuyer, 
        billingDetails: testBillingDetails, 
        delivery: testDeliveryDetails, 
        lastEdited: new Date().toISOString(), 
        status: status.PENDING, 
        totalPrice: testItem.price * 2, 
        createdAt: new Date(), 
        orderXMLId: 789, 
      };
      const orderId = Number(mockOrder.id) + 1000; 
    
      (getUser as jest.Mock).mockResolvedValue(testBuyer);
      (getOrder as jest.Mock).mockResolvedValue(null); 
      (updateOrder as jest.Mock).mockResolvedValue(true);
      (getOrderXML as jest.Mock).mockResolvedValue('Example XML');
    
      let result;
      try {
        result = await orderConfirm(userId, orderId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          result = { error: error.message }; 
        } else {
          result = { error: "Unknown error occurred" }; 
        }
      }
    
      expect(result).toStrictEqual({ error: expect.any(String) });
      expect(getOrder).toHaveBeenCalledWith(orderId); 
    });

    test("Should return 401 for invalid userId", async () => {
      const mockOrder: Order = {
        id: testBuyer.id,
        items: [testItem], 
        quantities: [2], 
        buyer: testBuyer, 
        billingDetails: testBillingDetails, 
        delivery: testDeliveryDetails, 
        lastEdited: new Date().toISOString(), 
        status: status.PENDING, 
        totalPrice: testItem.price * 2, 
        createdAt: new Date(), 
        orderXMLId: 789, 
      };
      const orderId = Number(mockOrder.id); 
    
      (getUser as jest.Mock).mockResolvedValue(null);
      (getOrder as jest.Mock).mockResolvedValue(mockOrder); 
      (updateOrder as jest.Mock).mockResolvedValue(true);
      (getOrderXML as jest.Mock).mockResolvedValue('Example XML');
    
      let result;
      try {
        result = await orderConfirm(userId + 1000, orderId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          result = { error: error.message }; 
        } else {
          result = { error: "Unknown error occurred" }; 
        }
      }
    
      expect(result).toStrictEqual({ error: expect.any(String) });
      expect(getOrder).not.toHaveBeenCalledWith(orderId); 
    });

    test("Should return 400 since order is cancelled", async () => {
      const mockOrder: Order = {
        id: testBuyer.id,
        items: [testItem], 
        quantities: [2], 
        buyer: testBuyer, 
        billingDetails: testBillingDetails, 
        delivery: testDeliveryDetails, 
        lastEdited: new Date().toISOString(), 
        status: status.CANCELLED, 
        totalPrice: testItem.price * 2, 
        createdAt: new Date(), 
        orderXMLId: 789, 
      };
      const orderId = Number(mockOrder.id); 
    
      (getUser as jest.Mock).mockResolvedValue(orderId);
      (getOrder as jest.Mock).mockResolvedValue(mockOrder); 
      (updateOrder as jest.Mock).mockResolvedValue(true);
      (getOrderXML as jest.Mock).mockResolvedValue('Example XML');
    
      let result;
      try {
        result = await orderConfirm(userId, orderId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          result = { error: error.message }; 
        } else {
          result = { error: "Unknown error occurred" }; 
        }
      }
    
      expect(result).toStrictEqual({ error: expect.any(String) });
      expect(getOrder).toHaveBeenCalledWith(orderId); 
    });
  });