import pool from '../db';
import { User, UserSimple, Item, BillingDetails, DeliveryInstructions, Order } from '../types';
import { addUser, getUser, getUserSimple, getAllUsers, updateUser, deleteUser,
         addToken, validToken, deleteToken,
         addItem, getItem, getItemsBySeller, getItemSellerSales, getPopularItems, getItemBuyerRecommendations, deleteItem,
         addOrder, getOrder, getOrdersByBuyer, updateOrder, deleteOrder,
         addOrderXML, getOrderXML, getLatestOrderXML, getAllOrderXMLs, deleteOrderXMLs } from '../dataStore';

let seller1Id: number,             seller2Id: number,             buyerId: number, buyerToken: string;
let testSeller1Simple: UserSimple, testSeller2Simple: UserSimple, testBuyerSimple: UserSimple;
let testSeller1: User,             testSeller2: User,             testBuyer: User;
let testItem1: Item,               testItem2: Item,               testItem3: Item;
let testOrder1: Order,             testOrder2: Order,             testOrder3: Order;
let orderXML1Id: number, testOrderXML1: string, orderXML2Id: number, testOrderXML2: string;
let testBillingDetails: BillingDetails, testDeliveryDetails: DeliveryInstructions;
const date = new Date().toISOString().split('T')[0];

describe('Test dataStore helpers', () => {
  beforeAll(async () => {
    testSeller1 = {
      id: null,
      nameFirst: 'Sam',
      nameLast: 'Seller',
      email: 'samseller@salesam.com',
      password: 'd0n773llS4m',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2
    };
    testSeller1Simple = {
      id: null,
      name: 'Sam Seller',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };

    testSeller2 = {
      id: null,
      nameFirst: 'Vincent',
      nameLast: 'Vendor',
      email: 'vincentvendor@vendingvince.com',
      password: 'v3nd1ngm4ch1n3v1c70ry',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2
    };
    testSeller2Simple = {
      id: null,
      name: 'Vincent Vendor',
      streetName: 'Yellow St',
      cityName: 'Brisbane',
      postalZone: '4000',
      cbcCode: 'AU'
    };

    testBuyer = {
      id: null,
      nameFirst: 'Bill',
      nameLast: 'Buyer',
      email: 'billbuyer@buybills.com',
      password: 'd0ntBuyW17hB1ll5',
      streetName: 'White St',
      cityName: 'Sydney',
      postalZone: '2000',
      cbcCode: 'AU',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2
    };
    testBuyerSimple = {
      id: null,
      name: 'Bill Buyer',
      streetName: 'White St',
      cityName: 'Sydney',
      postalZone: '2000',
      cbcCode: 'AU'
    };
    buyerToken = 'UV798jIrwsoIpBEAqsatod58AfVijf02';

    testItem1 = {
      id: 123,
      name: 'Beer-Flavoured Soap',
      seller: testSeller1Simple,
      price: 5,
      description: 'This is soap',
    };
    testItem2 = {
      id: 456,
      name: 'Tennis Table',
      seller: testSeller2Simple,
      price: 80,
      description: 'This is a tennis table',
    }
    testItem3 = {
      id: 789,
      name: 'Clothes Steamer',
      seller: testSeller1Simple,
      price: 200,
      description: 'This is a clothes steamer',
    }

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
    };

    testOrder1 = {
      items: [testItem1],
      quantities: [5],
      buyer: testBuyerSimple,
      billingDetails: testBillingDetails,
      totalPrice: 25,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    };

    testOrder2 = {
      items: [testItem1, testItem2],
      quantities: [3, 2],
      buyer: testBuyerSimple,
      billingDetails: testBillingDetails,
      totalPrice: 175,
      taxAmount: 17,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    };

    testOrder3 = {
      items: [testItem3],
      quantities: [1],
      buyer: testBuyerSimple,
      billingDetails: testBillingDetails,
      totalPrice: 200,
      taxAmount: 0,
      delivery: testDeliveryDetails,
      lastEdited: date,
      createdAt: new Date(),
    };

    testOrderXML1 = 
   `<Order>
      <OrderId>123456</OrderId>
      <TotalAmount>25.00</TotalAmount>
      <OrderDate>2025-04-03T14:22:00Z</OrderDate>
      <Status>This order has just been made</Status>
    </Order>`;

    testOrderXML2 = 
   `<Order>
      <OrderId>123456</OrderId>
      <TotalAmount>25.00</TotalAmount>
      <OrderDate>2025-04-03T14:22:00Z</OrderDate>
      <Status>This order has just had some changes made to it</Status>
    </Order>`;
  });

  afterAll(async () => {
    await pool.end();
  }, 5000);

  test('Using every add/get/update/delete', async () => {                    // DATA ADDED:
    // Adding/getting users                                                     🧑Users
    seller1Id = await addUser(testSeller1);
    seller2Id = await addUser(testSeller2);
    buyerId = await addUser(testBuyer);

    expect(Number.isInteger(seller1Id));
    expect(Number.isInteger(seller2Id));
    expect(Number.isInteger(buyerId));

    testSeller1.id = seller1Id;
    testSeller1Simple.id = seller1Id;
    testSeller2.id = seller2Id;
    testSeller2Simple.id = seller2Id;
    testBuyer.id = buyerId;
    testBuyerSimple.id = buyerId;
    expect(await getUser(buyerId)).toStrictEqual(testBuyer);
    expect(await getUserSimple(seller1Id)).toStrictEqual(testSeller1Simple);
    expect(await getAllUsers()).toStrictEqual([testSeller1, testSeller2, testBuyer]);

    // Updating/getting user                                                    🧑Users
    testBuyer.password = 'newPassword123';
    testBuyer.numFailedPasswordsSinceLastLogin = 42;
    expect(await updateUser(testBuyer));
    expect(await getUser(buyerId)).toStrictEqual(testBuyer);

    // Adding/validating token                                                  🧑Users 🥮Tokens
    expect(await addToken(buyerToken, buyerId));
    expect(await validToken(buyerToken));
    expect(!await validToken('thisIsNotAToken'));

    // Adding/getting items                                                     🧑Users 🥮Tokens 💎Items
    testItem1.id = await addItem(testItem1);
    expect(Number.isInteger(testItem1.id));
    testItem2.id = await addItem(testItem2);
    expect(Number.isInteger(testItem2.id));
    testItem3.id = await addItem(testItem3);
    expect(Number.isInteger(testItem3.id));

    expect(await getItem(Number(testItem2.id))).toStrictEqual(testItem2);
    expect(await getItemsBySeller(seller1Id)).toStrictEqual([testItem1, testItem3]);

    // Adding/getting orders                                                    🧑Users 🥮Tokens 💎Items 📦Orders
    testOrder1.id = await addOrder(testOrder1);
    expect(Number.isInteger(testOrder1.id));
    testOrder2.id = await addOrder(testOrder2);
    expect(Number.isInteger(testOrder2.id));
    testOrder3.id = await addOrder(testOrder3);
    expect(Number.isInteger(testOrder3.id));

    expect(await getOrder(Number(testOrder2.id))).toStrictEqual(testOrder2);
    expect(await getOrdersByBuyer(buyerId)).toStrictEqual([testOrder1, testOrder2, testOrder3]);

    // Updating/getting order                                                   🧑Users 🥮Tokens 💎Items 📦Orders
    testOrder2.quantities[0] += 1;
    testOrder2.totalPrice += 5;
    testOrder2.taxAmount = Number(testOrder2.taxAmount) + 0.5;
    expect(await updateOrder(testOrder2));
    expect(await getOrder(Number(testOrder2.id))).toStrictEqual(testOrder2);

    // Getting order/item sales stuff                                           🧑Users 🥮Tokens 💎Items 📦Orders
    expect(await getItemSellerSales(seller1Id)).toStrictEqual([
      {
        id: 123,
        name: 'Beer-Flavoured Soap',
        price: 5,
        description: 'This is soap',
        amountSold: 9
      },
      {
        id: 789,
        name: 'Clothes Steamer',
        price: 200,
        description: 'This is a clothes steamer',
        amountSold: 1
      }
    ]);

    expect(await getPopularItems(2)).toStrictEqual([testItem1, testItem2]);
    expect(await getPopularItems(4)).toStrictEqual([testItem1, testItem2, testItem3]);

    expect(await getItemBuyerRecommendations(buyerId, 1)).toStrictEqual([testItem1]);
    expect(await getItemBuyerRecommendations(buyerId, 3)).toStrictEqual([testItem1, testItem2]);

    // Adding/getting order XMLs                                                🧑Users 🥮Tokens 💎Items 📦Orders 📝OrderXMLs
    orderXML1Id = await addOrderXML(Number(testOrder1.id), testOrderXML1);
    expect(Number.isInteger(orderXML1Id));
    orderXML2Id = await addOrderXML(Number(testOrder1.id), testOrderXML2);
    expect(Number.isInteger(orderXML2Id));

    expect(await getOrderXML(orderXML1Id)).toStrictEqual(testOrderXML1);
    expect(await getLatestOrderXML(Number(testOrder1.id))).toStrictEqual(testOrderXML2);
    expect(await getAllOrderXMLs(Number(testOrder1.id))).toStrictEqual([testOrderXML2, testOrderXML1]);

    // Deleting order XMLs                                                      🧑Users 🥮Tokens 💎Items 📦Orders
    expect(await deleteOrderXMLs(Number(testOrder1.id)));

    // Deleting orders                                                          🧑Users 🥮Tokens 💎Items
    expect(await deleteOrder(Number(testOrder1.id)));
    expect(await deleteOrder(Number(testOrder2.id)));
    expect(await deleteOrder(Number(testOrder3.id)));
    expect(await getOrder(Number(testOrder1.id))).toBeNull();

    // Deleting items                                                           🧑Users 🥮Tokens
    expect(await deleteItem(Number(testItem1.id)));
    expect(await deleteItem(Number(testItem2.id)));
    expect(await deleteItem(Number(testItem3.id)));
    expect(await getItem(Number(testItem2.id))).toBeNull();

    // Deleting token                                                           🧑Users
    expect(await deleteToken(buyerToken));
    expect(!await validToken(buyerToken));

    // Deleting users                                                           DATA CLEARED
    expect(await deleteUser(seller1Id));
    expect(await deleteUser(seller2Id));
    expect(await deleteUser(buyerId));
    expect(await getUser(buyerId)).toBeNull();
  }, 40000);

  
    
});

