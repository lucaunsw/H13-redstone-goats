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
exports.getPostResponse = getPostResponse;
const sync_request_curl_1 = __importDefault(require("sync-request-curl"));
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("../types");
const dataStore_1 = require("../dataStore");
const app_1 = require("../app");
const client_1 = require("@redis/client");
const server_1 = require("../server");
dotenv_1.default.config();
function getPostResponse(route, body) {
    const res = (0, sync_request_curl_1.default)("POST", SERVER_URL + route, {
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
let userId;
let testName;
let testBuyer;
let testSeller;
let testItem;
let testBillingDetails;
let testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
describe("Tests for orderCancel", () => {
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
    test("Should successfully cancel an order", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockOrder = {
            id: testBuyer.id,
            items: [testItem],
            quantities: [2],
            buyer: testBuyer,
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            lastEdited: new Date().toISOString(),
            status: types_1.status.PENDING,
            totalPrice: testItem.price * 2,
            createdAt: new Date(),
            orderXMLId: 789,
        };
        const mockReason = 'Changed my mind';
        const orderId = mockOrder.id;
        dataStore_1.getUser.mockResolvedValue(orderId);
        dataStore_1.getOrder.mockResolvedValue(mockOrder);
        dataStore_1.updateOrder.mockResolvedValue(true);
        const result = yield (0, app_1.orderCancel)(userId, Number(orderId), mockReason);
        expect(result).toStrictEqual({ reason: mockReason });
        expect(dataStore_1.getOrder).toHaveBeenCalledWith(orderId);
    }));
    test("Unable to cancel error due to invalid userId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockOrder = {
            id: testBuyer.id,
            items: [testItem],
            quantities: [2],
            buyer: testBuyer,
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            lastEdited: new Date().toISOString(),
            status: types_1.status.PENDING,
            totalPrice: testItem.price * 2,
            createdAt: new Date(),
            orderXMLId: 789,
        };
        const mockReason = 'Changed my mind';
        const orderId = mockOrder.id;
        dataStore_1.getUser.mockResolvedValue(null);
        dataStore_1.getOrder.mockResolvedValue(mockOrder);
        dataStore_1.updateOrder.mockResolvedValue(true);
        let result;
        try {
            result = yield (0, app_1.orderCancel)(userId + 1000, Number(orderId), mockReason);
        }
        catch (error) {
            if (error instanceof Error) {
                result = { error: error.message };
            }
            else {
                result = { error: "Unknown error occurred" };
            }
        }
        expect(result).toStrictEqual({ error: expect.any(String) });
        expect(dataStore_1.getOrder).not.toHaveBeenCalled();
    }));
    test("Unable to cancel error due to invalid orderId", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockOrder = {
            id: testBuyer.id,
            items: [testItem],
            quantities: [2],
            buyer: testBuyer,
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            lastEdited: new Date().toISOString(),
            status: types_1.status.PENDING,
            totalPrice: testItem.price * 2,
            createdAt: new Date(),
            orderXMLId: 789,
        };
        const mockReason = 'Changed my mind';
        const orderId = Number(mockOrder.id) + 10000;
        dataStore_1.getUser.mockResolvedValue(null);
        dataStore_1.getOrder.mockResolvedValue(mockOrder);
        dataStore_1.updateOrder.mockResolvedValue(true);
        let result;
        try {
            result = yield (0, app_1.orderCancel)(userId, orderId, mockReason);
        }
        catch (error) {
            if (error instanceof Error) {
                result = { error: error.message };
            }
            else {
                result = { error: "Unknown error occurred" };
            }
        }
        expect(result).toStrictEqual({ error: expect.any(String) });
        expect(dataStore_1.getOrder).not.toHaveBeenCalled();
    }));
    test("Invalid orderId", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = {
            id: 1,
            nameFirst: "Test",
            nameLast: "User",
            email: "TestUser8@gmail.com",
            password: "validPass123",
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 2,
        };
        const mockReason = 'Changed my mind';
        const orderId = 1;
        dataStore_1.getUser.mockResolvedValue(user);
        dataStore_1.getOrder.mockResolvedValue(null);
        let result;
        try {
            result = yield (0, app_1.orderCancel)(userId, orderId, mockReason);
        }
        catch (error) {
            if (error instanceof Error) {
                result = { error: error.message };
            }
            else {
                result = { error: "Unknown error occurred" };
            }
        }
        expect(result).toStrictEqual({ error: expect.any(String) });
        expect(dataStore_1.getOrder).toHaveBeenCalledTimes(1);
    }));
    test("Unable to cancel since order is already cancelled", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockOrder = {
            id: testBuyer.id,
            items: [testItem],
            quantities: [2],
            buyer: testBuyer,
            billingDetails: testBillingDetails,
            delivery: testDeliveryDetails,
            lastEdited: new Date().toISOString(),
            status: types_1.status.CANCELLED,
            totalPrice: testItem.price * 2,
            createdAt: new Date(),
            orderXMLId: 789,
        };
        const mockReason = 'Changed my mind';
        const orderId = mockOrder.id;
        dataStore_1.getUser.mockResolvedValue(testBuyer);
        dataStore_1.getOrder.mockResolvedValue(mockOrder);
        let result;
        try {
            result = yield (0, app_1.orderCancel)(userId, Number(orderId), mockReason);
        }
        catch (error) {
            if (error instanceof Error) {
                result = { error: error.message };
            }
            else {
                result = { error: "Unknown error occurred" };
            }
        }
        expect(result).toStrictEqual({ error: expect.any(String) });
        expect(dataStore_1.getOrder).toHaveBeenCalledWith(Number(orderId));
        expect(dataStore_1.updateOrder).not.toHaveBeenCalled();
    }));
});
