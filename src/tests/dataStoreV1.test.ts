import pool from '../db';
import { UserV1, UserSimpleV1, ItemV1, BillingDetailsV1, DeliveryInstructionsV1, OrderV1 } from '../types';
import { addUserV1, getUserV1, getUserSimpleV1, getAllUsersV1, updateUserV1, deleteUserV1,
         addTokenV1, validTokenV1, deleteTokenV1,
         addItemV1, getItemV1, getItemsBySellerV1, getItemSellerSalesV1, getPopularItemsV1, getItemBuyerRecommendationsV1, deleteItemV1,
         addOrderV1, getOrderV1, getOrdersByBuyerV1, updateOrderV1, deleteOrderV1,
         addOrderXMLV1, getOrderXMLV1, getLatestOrderXMLV1, getAllOrderXMLsV1, deleteOrderXMLsV1 } from '../dataStoreV1';

let seller1Id: number,               seller2Id: number,             buyerId: number, buyerToken: string;
let testSeller1Simple: UserSimpleV1, testSeller2Simple: UserSimpleV1, testBuyerSimple: UserSimpleV1;
let testSeller1: UserV1,             testSeller2: UserV1,             testBuyer: UserV1;
let testItem1: ItemV1,               testItem2: ItemV1,               testItem3: ItemV1;
let testOrder1: OrderV1,             testOrder2: OrderV1,             testOrder3: OrderV1;
let orderXML1Id: number, testOrderXML1: string,  orderXML2Id: number, testOrderXML2: string;
let testBillingDetails: BillingDetailsV1, testDeliveryDetails: DeliveryInstructionsV1;
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

  test('Using every V1 function', async () => {                              // DATA ADDED:
    // Adding/getting users                                                     🧑Users
    seller1Id = await addUserV1(testSeller1);
    seller2Id = await addUserV1(testSeller2);
    buyerId = await addUserV1(testBuyer);

    expect(Number.isInteger(seller1Id));
    expect(Number.isInteger(seller2Id));
    expect(Number.isInteger(buyerId));

    testSeller1.id = seller1Id;
    testSeller1Simple.id = seller1Id;
    testSeller2.id = seller2Id;
    testSeller2Simple.id = seller2Id;
    testBuyer.id = buyerId;
    testBuyerSimple.id = buyerId;
    expect(await getUserV1(buyerId)).toStrictEqual(testBuyer);
    expect(await getUserSimpleV1(seller1Id)).toStrictEqual(testSeller1Simple);
    expect(await getAllUsersV1()).toStrictEqual([testSeller1, testSeller2, testBuyer]);

    // Updating/getting user                                                    🧑Users
    testBuyer.password = 'newPassword123';
    testBuyer.numFailedPasswordsSinceLastLogin = 42;
    expect(await updateUserV1(testBuyer));
    expect(await getUserV1(buyerId)).toStrictEqual(testBuyer);

    // Adding/validating token                                                  🧑Users 🥮Tokens
    expect(await addTokenV1(buyerToken, buyerId));
    expect(await validTokenV1(buyerToken));
    expect(!await validTokenV1('thisIsNotAToken'));

    // Adding/getting items                                                     🧑Users 🥮Tokens 💎Items
    testItem1.id = await addItemV1(testItem1);
    expect(Number.isInteger(testItem1.id));
    testItem2.id = await addItemV1(testItem2);
    expect(Number.isInteger(testItem2.id));
    testItem3.id = await addItemV1(testItem3);
    expect(Number.isInteger(testItem3.id));

    expect(await getItemV1(Number(testItem2.id))).toStrictEqual(testItem2);
    expect(await getItemsBySellerV1(seller1Id)).toStrictEqual([testItem1, testItem3]);

    // Adding/getting orders                                                    🧑Users 🥮Tokens 💎Items 📦Orders
    testOrder1.id = await addOrderV1(testOrder1);
    expect(Number.isInteger(testOrder1.id));
    testOrder2.id = await addOrderV1(testOrder2);
    expect(Number.isInteger(testOrder2.id));
    testOrder3.id = await addOrderV1(testOrder3);
    expect(Number.isInteger(testOrder3.id));

    expect(await getOrderV1(Number(testOrder2.id))).toStrictEqual(testOrder2);
    expect(await getOrdersByBuyerV1(buyerId)).toStrictEqual([testOrder1, testOrder2, testOrder3]);

    // Updating/getting order                                                   🧑Users 🥮Tokens 💎Items 📦Orders
    testOrder2.quantities[0] += 1;
    testOrder2.totalPrice += 5;
    testOrder2.taxAmount = Number(testOrder2.taxAmount) + 0.5;
    expect(await updateOrderV1(testOrder2));
    expect(await getOrderV1(Number(testOrder2.id))).toStrictEqual(testOrder2);

    // Getting order/item sales stuff                                           🧑Users 🥮Tokens 💎Items 📦Orders
    expect(await getItemSellerSalesV1(seller1Id)).toStrictEqual([
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

    expect(await getPopularItemsV1(2)).toStrictEqual([testItem1, testItem2]);
    expect(await getPopularItemsV1(4)).toStrictEqual([testItem1, testItem2, testItem3]);

    expect(await getItemBuyerRecommendationsV1(buyerId, 1)).toStrictEqual([testItem1]);
    expect(await getItemBuyerRecommendationsV1(buyerId, 3)).toStrictEqual([testItem1, testItem2]);

    // Adding/getting order XMLs                                                🧑Users 🥮Tokens 💎Items 📦Orders 📝OrderXMLs
    orderXML1Id = await addOrderXMLV1(Number(testOrder1.id), testOrderXML1);
    expect(Number.isInteger(orderXML1Id));
    orderXML2Id = await addOrderXMLV1(Number(testOrder1.id), testOrderXML2);
    expect(Number.isInteger(orderXML2Id));

    expect(await getOrderXMLV1(orderXML1Id)).toStrictEqual(testOrderXML1);
    expect(await getLatestOrderXMLV1(Number(testOrder1.id))).toStrictEqual(testOrderXML2);
    expect(await getAllOrderXMLsV1(Number(testOrder1.id))).toStrictEqual([testOrderXML2, testOrderXML1]);

    // Deleting order XMLs                                                      🧑Users 🥮Tokens 💎Items 📦Orders
    expect(await deleteOrderXMLsV1(Number(testOrder1.id)));

    // Deleting orders                                                          🧑Users 🥮Tokens 💎Items
    expect(await deleteOrderV1(Number(testOrder1.id)));
    expect(await deleteOrderV1(Number(testOrder2.id)));
    expect(await deleteOrderV1(Number(testOrder3.id)));
    expect(await getOrderV1(Number(testOrder1.id))).toBeNull();

    // Deleting items                                                           🧑Users 🥮Tokens
    expect(await deleteItemV1(Number(testItem1.id)));
    expect(await deleteItemV1(Number(testItem2.id)));
    expect(await deleteItemV1(Number(testItem3.id)));
    expect(await getItemV1(Number(testItem2.id))).toBeNull();

    // Deleting token                                                           🧑Users
    expect(await deleteTokenV1(buyerToken));
    expect(!await validTokenV1(buyerToken));

    // Deleting users                                                           DATA CLEARED
    expect(await deleteUserV1(seller1Id));
    expect(await deleteUserV1(seller2Id));
    expect(await deleteUserV1(buyerId));
    expect(await getUserV1(buyerId)).toBeNull();
  }, 40000);
});

