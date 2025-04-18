import pool from '../db';
import { UserV1, UserSimpleV2, ItemV2, BillingDetailsV1,
  DeliveryInstructionsV1, OrderV2, status } from '../types';
import { addUserV1, deleteUserV1, deleteItemV1, deleteOrderV1 } from '../dataStoreV1';
import { getUserSimpleV2, addItemV2, getItemV2, getItemBuyersV2, addOrderV2, getOrderV2,
  getOrdersByBuyerV2, updateOrderV2, confirmOrderV2, cancelOrderV2 } from '../dataStoreV2';

let seller1Id: number,               seller2Id: number,               buyerId: number;
let testSeller1Simple: UserSimpleV2, testSeller2Simple: UserSimpleV2, testBuyerSimple: UserSimpleV2;
let testSeller1: UserV1,             testSeller2: UserV1,             testBuyer: UserV1;
let testItem1: ItemV2,               testItem2: ItemV2,               testItem3: ItemV2;
let testOrder1: OrderV2,             testOrder2: OrderV2,             testOrder3: OrderV2;
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
      email: 'samseller@salesam.com',
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
      email: 'vincentvendor@vendingvince.com',
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
      phone: '0444911911',
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
      email: 'billbuyer@buybills.com',
      phone: '0444911911',
      streetName: 'White St',
      cityName: 'Sydney',
      postalZone: '2000',
      cbcCode: 'AU'
    };

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
      delivery: testDeliveryDetails,
      lastEdited: date,
      totalPrice: 25,
      taxAmount: 5,
      taxTotal: 30,
      currency: 'AUD',
      paymentAccountId: 'accountIdHere',
      paymentAccountName: 'Payment Palace',
      financialInstitutionBranchId: '123456789',
      status: status.PENDING,
      createdAt: new Date()
    };

    testOrder2 = {
      items: [testItem1, testItem2],
      quantities: [3, 2],
      buyer: testBuyerSimple,
      billingDetails: testBillingDetails,
      delivery: testDeliveryDetails,
      lastEdited: date,
      totalPrice: 175,
      taxAmount: 17,
      taxTotal: 192,
      currency: 'AUD',
      paymentAccountId: 'accountIdHere',
      paymentAccountName: 'Payment Palace',
      financialInstitutionBranchId: '123456789',
      status: status.CONFIRMED,
      createdAt: new Date()
    };
  });

  afterAll(async () => {
    await pool.end();
  }, 5000);

  test('Using every V2 function', async () => {                              // DATA ADDED:
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

    expect(await getUserSimpleV2(seller1Id)).toStrictEqual(testSeller1Simple);
    expect(await getUserSimpleV2(buyerId)).toStrictEqual(testBuyerSimple);

    // Adding/getting items                                                     🧑Users 💎Items
    testItem1.id = await addItemV2(testItem1);
    expect(Number.isInteger(testItem1.id));
    testItem2.id = await addItemV2(testItem2);
    expect(Number.isInteger(testItem2.id));
    testItem3.id = await addItemV2(testItem3);
    expect(Number.isInteger(testItem3.id));

    expect(await getItemV2(Number(testItem2.id))).toStrictEqual(testItem2);

    // Adding/getting orders                                                    🧑Users 💎Items 📦Orders
    testOrder1.id = await addOrderV2(testOrder1);
    expect(Number.isInteger(testOrder1.id));
    testOrder2.id = await addOrderV2(testOrder2);
    expect(Number.isInteger(testOrder2.id));

    expect(await getOrderV2(Number(testOrder2.id))).toStrictEqual(testOrder2);
    expect(await getOrdersByBuyerV2(buyerId)).toStrictEqual([testOrder1, testOrder2]);

    // Updating/getting order                                                   🧑Users 💎Items 📦Orders
    testOrder2.quantities[0] += 1;
    testOrder2.totalPrice += 5;
    testOrder2.taxAmount = Number(testOrder2.taxAmount) + 0.5;
    testOrder2.taxTotal = Number(testOrder2.taxAmount) + 0.5;
    expect(await updateOrderV2(testOrder2));
    expect(await getOrderV2(Number(testOrder2.id))).toStrictEqual(testOrder2);

    // Getting order/item buyers stuff                                          🧑Users 💎Items 📦Orders
    expect(await getItemBuyersV2(Number(testItem1.id))).toStrictEqual([
      {
        buyer: testBuyerSimple,
        quantity: 5,
        status: status.PENDING
      },
      {
        buyer: testBuyerSimple,
        quantity: 4,
        status: status.CONFIRMED
      }
    ]);

    // Confirming/cancelling order                                              🧑Users 💎Items 📦Orders
    testOrder1.status = status.CONFIRMED;
    expect(await confirmOrderV2(Number(testOrder1.id)));
    expect(await getOrderV2(Number(testOrder1.id))).toStrictEqual(testOrder1);

    testOrder2.status = status.CANCELLED;
    expect(await cancelOrderV2(Number(testOrder2.id)));
    expect(await getOrderV2(Number(testOrder2.id))).toStrictEqual(testOrder2);

    // Deleting orders                                                          🧑Users 💎Items
    expect(await deleteOrderV1(Number(testOrder1.id)));
    expect(await deleteOrderV1(Number(testOrder2.id)));

    // Deleting items                                                           🧑Users
    expect(await deleteItemV1(Number(testItem1.id)));
    expect(await deleteItemV1(Number(testItem2.id)));
    expect(await deleteItemV1(Number(testItem3.id)));

    // Deleting users                                                           DATA CLEARED
    expect(await deleteUserV1(seller1Id));
    expect(await deleteUserV1(seller2Id));
    expect(await deleteUserV1(buyerId));
  }, 30000);
});

