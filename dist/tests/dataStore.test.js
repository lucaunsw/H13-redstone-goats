"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const dataStore_1 = require("../dataStore");
let seller1Id, seller2Id, buyerId, buyerToken;
let testSeller1Simple, testSeller2Simple, testBuyerSimple;
let testSeller1, testSeller2, testBuyer;
let testItem1, testItem2, testItem3;
let testOrder1, testOrder2, testOrder3;
let orderXML1Id, testOrderXML1, orderXML2Id, testOrderXML2;
let testBillingDetails, testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
describe('Test dataStore helpers', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
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
        };
        testItem3 = {
            id: 789,
            name: 'Clothes Steamer',
            seller: testSeller1Simple,
            price: 200,
            description: 'This is a clothes steamer',
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
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.default.end();
    }), 5000);
    test('Using every add/get/update/delete', () => __awaiter(void 0, void 0, void 0, function* () {
        // Adding/getting users                                                     🧑Users
        seller1Id = yield (0, dataStore_1.addUser)(testSeller1);
        seller2Id = yield (0, dataStore_1.addUser)(testSeller2);
        buyerId = yield (0, dataStore_1.addUser)(testBuyer);
        expect(Number.isInteger(seller1Id));
        expect(Number.isInteger(seller2Id));
        expect(Number.isInteger(buyerId));
        testSeller1.id = seller1Id;
        testSeller1Simple.id = seller1Id;
        testSeller2.id = seller2Id;
        testSeller2Simple.id = seller2Id;
        testBuyer.id = buyerId;
        testBuyerSimple.id = buyerId;
        expect(yield (0, dataStore_1.getUser)(buyerId)).toStrictEqual(testBuyer);
        expect(yield (0, dataStore_1.getUserSimple)(seller1Id)).toStrictEqual(testSeller1Simple);
        expect(yield (0, dataStore_1.getAllUsers)()).toStrictEqual([testSeller1, testSeller2, testBuyer]);
        // Updating/getting user                                                    🧑Users
        testBuyer.password = 'newPassword123';
        testBuyer.numFailedPasswordsSinceLastLogin = 42;
        expect(yield (0, dataStore_1.updateUser)(testBuyer));
        expect(yield (0, dataStore_1.getUser)(buyerId)).toStrictEqual(testBuyer);
        // Adding/validating token                                                  🧑Users 🥮Tokens
        expect(yield (0, dataStore_1.addToken)(buyerToken, buyerId));
        expect(yield (0, dataStore_1.validToken)(buyerToken));
        expect(!(yield (0, dataStore_1.validToken)('thisIsNotAToken')));
        // Adding/getting items                                                     🧑Users 🥮Tokens 💎Items
        testItem1.id = yield (0, dataStore_1.addItem)(testItem1);
        expect(Number.isInteger(testItem1.id));
        testItem2.id = yield (0, dataStore_1.addItem)(testItem2);
        expect(Number.isInteger(testItem2.id));
        testItem3.id = yield (0, dataStore_1.addItem)(testItem3);
        expect(Number.isInteger(testItem3.id));
        expect(yield (0, dataStore_1.getItem)(Number(testItem2.id))).toStrictEqual(testItem2);
        expect(yield (0, dataStore_1.getItemsBySeller)(seller1Id)).toStrictEqual([testItem1, testItem3]);
        // Adding/getting orders                                                    🧑Users 🥮Tokens 💎Items 📦Orders
        testOrder1.id = yield (0, dataStore_1.addOrder)(testOrder1);
        expect(Number.isInteger(testOrder1.id));
        testOrder2.id = yield (0, dataStore_1.addOrder)(testOrder2);
        expect(Number.isInteger(testOrder2.id));
        testOrder3.id = yield (0, dataStore_1.addOrder)(testOrder3);
        expect(Number.isInteger(testOrder3.id));
        expect(yield (0, dataStore_1.getOrder)(Number(testOrder2.id))).toStrictEqual(testOrder2);
        expect(yield (0, dataStore_1.getOrdersByBuyer)(buyerId)).toStrictEqual([testOrder1, testOrder2, testOrder3]);
        // Updating/getting order                                                   🧑Users 🥮Tokens 💎Items 📦Orders
        testOrder2.quantities[0] += 1;
        testOrder2.totalPrice += 5;
        expect(yield (0, dataStore_1.updateOrder)(testOrder2));
        expect(yield (0, dataStore_1.getOrder)(Number(testOrder2.id))).toStrictEqual(testOrder2);
        // Getting order/item sales stuff                                           🧑Users 🥮Tokens 💎Items 📦Orders
        expect(yield (0, dataStore_1.getItemSellerSales)(seller1Id)).toStrictEqual([
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
        expect(yield (0, dataStore_1.getPopularItems)(2)).toStrictEqual([testItem1, testItem2]);
        expect(yield (0, dataStore_1.getPopularItems)(4)).toStrictEqual([testItem1, testItem2, testItem3]);
        expect(yield (0, dataStore_1.getItemBuyerRecommendations)(buyerId, 1)).toStrictEqual([testItem1]);
        expect(yield (0, dataStore_1.getItemBuyerRecommendations)(buyerId, 3)).toStrictEqual([testItem1, testItem2]);
        // Adding/getting order XMLs                                                🧑Users 🥮Tokens 💎Items 📦Orders 📝OrderXMLs
        orderXML1Id = yield (0, dataStore_1.addOrderXML)(Number(testOrder1.id), testOrderXML1);
        expect(Number.isInteger(orderXML1Id));
        orderXML2Id = yield (0, dataStore_1.addOrderXML)(Number(testOrder1.id), testOrderXML2);
        expect(Number.isInteger(orderXML2Id));
        expect(yield (0, dataStore_1.getOrderXML)(orderXML1Id)).toStrictEqual(testOrderXML1);
        expect(yield (0, dataStore_1.getLatestOrderXML)(Number(testOrder1.id))).toStrictEqual(testOrderXML2);
        expect(yield (0, dataStore_1.getAllOrderXMLs)(Number(testOrder1.id))).toStrictEqual([testOrderXML2, testOrderXML1]);
        // Deleting order XMLs                                                      🧑Users 🥮Tokens 💎Items 📦Orders
        expect(yield (0, dataStore_1.deleteOrderXMLs)(Number(testOrder1.id)));
        // Deleting orders                                                          🧑Users 🥮Tokens 💎Items
        expect(yield (0, dataStore_1.deleteOrder)(Number(testOrder1.id)));
        expect(yield (0, dataStore_1.deleteOrder)(Number(testOrder2.id)));
        expect(yield (0, dataStore_1.deleteOrder)(Number(testOrder3.id)));
        expect(yield (0, dataStore_1.getOrder)(Number(testOrder1.id))).toBeNull();
        // Deleting items                                                           🧑Users 🥮Tokens
        expect(yield (0, dataStore_1.deleteItem)(Number(testItem1.id)));
        expect(yield (0, dataStore_1.deleteItem)(Number(testItem2.id)));
        expect(yield (0, dataStore_1.deleteItem)(Number(testItem3.id)));
        expect(yield (0, dataStore_1.getItem)(Number(testItem2.id))).toBeNull();
        // Deleting token                                                           🧑Users
        expect(yield (0, dataStore_1.deleteToken)(buyerToken));
        expect(!(yield (0, dataStore_1.validToken)(buyerToken)));
        // Deleting users                                                           DATA CLEARED
        expect(yield (0, dataStore_1.deleteUser)(seller1Id));
        expect(yield (0, dataStore_1.deleteUser)(seller2Id));
        expect(yield (0, dataStore_1.deleteUser)(buyerId));
        expect(yield (0, dataStore_1.getUser)(buyerId)).toBeNull();
        console.log("we did it");
    }), 40000);
});
