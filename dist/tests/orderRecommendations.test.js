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
const app_1 = require("../app");
const dataStore_1 = require("../dataStore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_1 = require("../server");
const client_1 = require("@redis/client");
jest.mock('../dataStore', () => ({
    getUser: jest.fn(),
    getItemBuyerRecommendations: jest.fn(),
    getPopularItems: jest.fn(),
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
let seller1Id, seller2Id, buyerId;
let testSeller1, testSeller2, testBuyer;
let testItem1, testItem2, testItem3;
let testBillingDetails, testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
describe('Tests for order recommendations', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        seller1Id = 1;
        seller2Id = 2;
        buyerId = 3;
        testSeller1 = {
            id: seller1Id,
            name: 'Sam Seller',
            streetName: 'Yellow St',
            cityName: 'Brisbane',
            postalZone: '4000',
            cbcCode: 'AU'
        };
        testSeller2 = {
            id: seller2Id,
            name: 'Sam Seller',
            streetName: 'Yellow St',
            cityName: 'Brisbane',
            postalZone: '4000',
            cbcCode: 'AU'
        };
        testItem1 = {
            id: 123,
            name: 'Beer-Flavoured Soap',
            seller: testSeller1,
            price: 5,
            description: 'This is soap',
        };
        testItem2 = {
            id: 124,
            name: 'Tennis Table',
            seller: testSeller2,
            price: 80,
            description: 'This is a tennis table',
        };
        testItem3 = {
            id: 124,
            name: 'Clothes Steamer',
            seller: testSeller1,
            price: 200,
            description: 'This is a clothes steamer',
        };
        testBuyer = {
            id: 3,
            name: 'Bill Buyer',
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
        };
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = (0, client_1.createClient)();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('Error from invalid limit', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, app_1.orderRecommendations)(seller1Id, -1)).
            rejects.toThrowError('Limit is not a positive integer');
        yield expect((0, app_1.orderRecommendations)(seller1Id, 1.5)).
            rejects.toThrowError('Limit is not a positive integer');
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(0);
        expect(dataStore_1.getItemBuyerRecommendations).toHaveBeenCalledTimes(0);
        expect(dataStore_1.getPopularItems).toHaveBeenCalledTimes(0);
    }));
    test('Error from invalid userId', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue(null);
        yield expect((0, app_1.orderRecommendations)(seller1Id + 10, 3)).
            rejects.toThrowError('Invalid userId');
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItemBuyerRecommendations).toHaveBeenCalledTimes(0);
        expect(dataStore_1.getPopularItems).toHaveBeenCalledTimes(0);
    }));
    test('Successul recommendation with no items', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'buyer',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemBuyerRecommendations.mockResolvedValue([]);
        dataStore_1.getPopularItems.mockResolvedValue([]);
        const response = yield (0, app_1.orderRecommendations)(seller1Id, 5);
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getPopularItems).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({
            recommendations: [],
        });
    }));
    test('Successul recommendation with enough recs, no popular items', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'buyer',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemBuyerRecommendations.mockResolvedValue([testItem1, testItem2]);
        const response = yield (0, app_1.orderRecommendations)(seller1Id, 2);
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getPopularItems).toHaveBeenCalledTimes(0);
        expect(response).toStrictEqual({
            recommendations: [testItem1, testItem2],
        });
    }));
    test('Successul recommendation with not enough recs, more popular items than needed', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'buyer',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemBuyerRecommendations.mockResolvedValue([testItem1]);
        dataStore_1.getPopularItems.mockResolvedValue([testItem2, testItem3]);
        const response = yield (0, app_1.orderRecommendations)(seller1Id, 2);
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItemBuyerRecommendations).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getPopularItems).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({
            recommendations: [testItem1, testItem2],
        });
    }));
});
