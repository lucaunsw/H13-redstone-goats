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
const testHelper_1 = require("./testHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
const sync_request_curl_1 = __importDefault(require("sync-request-curl"));
function requestOrderCreate(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = (0, sync_request_curl_1.default)("POST", SERVER_URL + `/v1/order/create`, {
            json: body,
            timeout: TIMEOUT_MS,
        });
        return {
            body: JSON.parse(res.body.toString()),
            statusCode: res.statusCode,
        };
    });
}
let userId;
let testName;
let testBuyer;
let testSeller;
let testItem;
let testBillingDetails;
let testDeliveryDetails;
const date = new Date().toISOString().split('T')[0];
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testHelper_1.reqHelper)('DELETE', '/v1/clear');
    testName = 'Bobby Jones';
    const token = yield (0, testHelper_1.userRegister)('example10@email.com', 'example123', 'Bobby', 'Jones').body.token;
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    const sellerToken = yield (0, testHelper_1.userRegister)('example20@email.com', 'example123', 'Test', 'Seller').body.token;
    const sellerId = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET).userId;
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
        creditCardNumber: 1000000000000000,
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
describe('Test orderCreate route', () => {
    test('Error from invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = userId + 1;
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: {
                userId: invalidUserId,
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid name', () => __awaiter(void 0, void 0, void 0, function* () {
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: {
                userId: userId,
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid total price', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid item', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid item (duplicate item ids)', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid bank details', () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date().toISOString().split('T')[0];
        const body = {
            items: [testItem],
            quantities: [1],
            buyer: testBuyer,
            billingDetails: {
                creditCardNumber: 100000000000000000,
                CVV: 111,
                expiryDate: date,
            },
            totalPrice: 5,
            delivery: testDeliveryDetails,
            lastEdited: date,
            createdAt: new Date(),
        };
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid delivery date (start date is before current date)', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Error from invalid delivery date (end date is before start date)', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Success case: Returns orderId', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield requestOrderCreate(body);
        expect(response.statusCode).toBe(201);
        expect(response.body).toStrictEqual({ orderId: expect.any(Number) });
    }));
});
