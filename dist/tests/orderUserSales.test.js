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
    getItemSellerSales: jest.fn(),
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
let sellerId;
let seller2Id;
let testBuyer;
let testSeller;
let testItem1;
let testItem2;
let testItem3;
let testBillingDetails;
let testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
describe('Order user sales send', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        sellerId = 1;
        seller2Id = 2;
        // testSeller = {
        //   id: sellerId,
        //   name: 'Bobby Jones',
        //   streetName: 'Yellow St',
        //   cityName: 'Brisbane',
        //   postalZone: '4000',
        //   cbcCode: 'AU'
        // };
        // testItem1 = {
        //   id: 123,
        //   name: 'Soap',
        //   seller: testSeller,
        //   price: 5,
        //   description: 'This is soap',
        // };
        // testItem2 = {
        //   id: 124,
        //   name: 'Table',
        //   seller: testSeller,
        //   price: 80,
        //   description: 'This is a table',
        // };
        // testItem3 = {
        //   id: 125,
        //   name: 'Paper',
        //   seller: testSeller,
        //   price: 10,
        //   description: 'This is paper',
        // };
        // testBuyer = {
        //   id: 3,
        //   name: 'Test User',
        //   streetName: 'White St',
        //   cityName: 'Sydney',
        //   postalZone: '2000',
        //   cbcCode: 'AU',
        // };
        // testBillingDetails = {
        //   creditCardNumber: "1000000000000000",
        //   CVV: 111,
        //   expiryDate: date,
        // };
        // testDeliveryDetails = {
        //   streetName: 'White St',
        //   cityName: 'Sydney',
        //   postalZone: '2000',
        //   countrySubentity: 'NSW',
        //   addressLine: '33 White St, Sydney NSW',
        //   cbcCode: 'AU',
        //   startDate: new Date(2025, 9, 5).toISOString().split('T')[0],
        //   startTime: '13:00',
        //   endDate: new Date(2025, 9, 10).toISOString().split('T')[0],
        //   endTime: '13:00'
        // }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = (0, client_1.createClient)();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('Error from no sellerId provided', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, app_1.orderUserSales)(true, true, true, null)).
            rejects.toThrowError('No sellerId provided');
    }));
    test('Error from invalid sellerId', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue(null);
        yield expect((0, app_1.orderUserSales)(true, true, true, sellerId + 10)).
            rejects.toThrowError('Invalid sellerId');
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, app_1.orderUserSales)(false, false, false, sellerId)).
            rejects.toThrowError('At least one data option should be selected');
    }));
    test('Displays no sales when order could not be created', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'seller',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemSellerSales.mockResolvedValue([]);
        const response = yield (0, app_1.orderUserSales)(true, true, true, sellerId);
        expect(dataStore_1.getUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItemSellerSales).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({
            sales: [],
            CSVurl: expect.any(String),
            PDFurl: expect.any(String),
        });
    }));
    test('Sucess case with no sales, with no csv, no pdf', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'seller',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemSellerSales.mockResolvedValue([]);
        const response = yield (0, app_1.orderUserSales)(false, true, false, seller2Id);
        expect(response).toStrictEqual({
            sales: [],
        });
    }));
    test('Success case with multiple sales', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getUser.mockResolvedValue({
            id: 1,
            nameFirst: 'mock',
            nameLast: 'seller',
            email: 'mockemail234@gmail.com',
            password: 'string1234',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 2,
        });
        dataStore_1.getItemSellerSales.mockResolvedValue([
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
            },
            {
                id: 125,
                name: 'Paper',
                description: 'This is paper',
                price: 10,
                amountSold: 4,
            },
        ]);
        const response = yield (0, app_1.orderUserSales)(true, true, true, 2);
        expect(response).toStrictEqual({
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
                },
                {
                    id: 125,
                    name: 'Paper',
                    description: 'This is paper',
                    price: 10,
                    amountSold: 4,
                }
            ],
            CSVurl: expect.any(String),
            PDFurl: expect.any(String),
        });
    }));
});
