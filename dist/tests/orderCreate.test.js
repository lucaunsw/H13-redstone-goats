"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// import { userRegister, reqHelper, requestOrderCreate } from './testHelper';
const app_1 = require("../app");
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("../server");
const dataStore_1 = require("../dataStore");
const helper_1 = require("../helper");
dotenv_1.default.config();
const client_1 = require("@redis/client");
jest.mock('../dataStore', () => ({
    addOrder: jest.fn(),
    addOrderXML: jest.fn(),
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
let userId;
let testName;
let testBuyer;
let testSeller;
let testItem;
let testBillingDetails;
let testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
describe('Test orderCreate route', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        testName = 'Bobby Jones';
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
        };
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = (0, client_1.createClient)();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('Error from no userId provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: {
                id: null,
                name: testName,
                streetName: 'White St',
                cityName: 'Sydney',
                postalZone: '2000',
                cbcCode: 'AU',
            },
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            totalPrice: 5,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('No userId provided');
    }));
    test('Error from invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(false);
        const invalidUserId = userId + 1;
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: {
                id: invalidUserId,
                name: testName,
                streetName: 'White St',
                cityName: 'Sydney',
                postalZone: '2000',
                cbcCode: 'AU',
            },
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            totalPrice: 5,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid name', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(false);
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: {
                id: userId,
                name: 'Apple Apple',
                streetName: 'White St',
                cityName: 'Sydney',
                postalZone: '2000',
                cbcCode: 'AU',
            },
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            totalPrice: 5,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid userId or a different name is registered to userId');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid total price', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        helper_1.validItemList.mockResolvedValue(40);
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Incorrect total price provided');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
        expect(helper_1.validItemList).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid seller', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(false);
        dataStore_1.getItem.mockResolvedValue(null);
        const body = {
            items: [{
                    id: 124,
                    name: 'Toothpaste',
                    seller: {
                        id: 1,
                        name: 'Test Seller',
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid seller(s)');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
    }));
    test('Error from no itemId provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        dataStore_1.getItem.mockResolvedValue(null);
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('No item Id provided');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid item price', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        dataStore_1.getItem.mockResolvedValue(null);
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: -2,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid item price');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItem).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid item quantity', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        dataStore_1.getItem.mockResolvedValue(null);
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid quantities provided');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItem).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid quantity list', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        helper_1.userExists.mockResolvedValueOnce(true);
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
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid amount of item quantities provided');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid item (duplicate item ids)', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        dataStore_1.getItem.mockResolvedValue(null);
        const body = {
            items: [{
                    id: 123,
                    name: 'Toothpaste',
                    seller: testSeller,
                    price: 5,
                    description: 'This is Toothpaste',
                }, testItem],
            quantities: [1, 1],
            buyer: testBuyer,
            seller: testSeller,
            billingDetails: testBillingDetails,
            totalPrice: 10,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Same item Id is registered to a different item name');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItem).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid item id', () => __awaiter(void 0, void 0, void 0, function* () {
        const helper = yield Promise.resolve().then(() => __importStar(require('../helper')));
        jest.spyOn(helper, 'validItemList').mockImplementation(jest.requireActual('../helper').validItemList);
        helper_1.userExists.mockResolvedValueOnce(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        dataStore_1.getItem.mockResolvedValue({
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
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Same item Id is registered to a different item name');
        expect(helper_1.userExists).toHaveBeenCalledTimes(1);
        expect(dataStore_1.getItem).toHaveBeenCalledTimes(1);
    }));
    test('Error from invalid bank details', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(true);
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
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid bank details');
    }));
    test('Error from invalid delivery date (start date is before current date)', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(true);
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
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid date selection');
    }));
    test('Error from invalid delivery date (end date is before start date)', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(true);
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
            createdAt: new Date(),
        };
        yield expect((0, app_1.orderCreate)(body)).rejects.toThrowError('Invalid date selection');
    }));
    test('Success case: Returns orderId', () => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.userExists.mockResolvedValue(true);
        helper_1.validSellers.mockResolvedValueOnce(true);
        helper_1.validItemList.mockResolvedValue(5);
        helper_1.addItems.mockResolvedValue({});
        dataStore_1.addOrder.mockResolvedValue(1);
        helper_1.generateUBL.mockResolvedValueOnce('Mock UBL');
        dataStore_1.addOrderXML.mockResolvedValue(1);
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
        };
        yield (0, app_1.orderCreate)(body);
        expect(dataStore_1.addOrderXML).toHaveBeenCalledTimes(1);
    }));
});
