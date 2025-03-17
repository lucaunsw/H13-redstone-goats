"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostResponse = getPostResponse;
const sync_request_curl_1 = __importDefault(require("sync-request-curl"));
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getPutResponse(route, body) {
    const res = (0, sync_request_curl_1.default)("PUT", SERVER_URL + route, {
        json: body,
        timeout: TIMEOUT_MS,
    });
    return {
        body: JSON.parse(res.body.toString()),
        statusCode: res.statusCode,
    };
}
beforeEach(() => {
    // Clear database
});
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
describe.skip("orderCancel successful return", () => {
    test("should cancel an order successfully", () => {
        const registerRes = getPostResponse("/v1/user/register", {
            email: "test@example.com",
            password: "securepassword123!",
            nameFirst: "Bruce",
            nameLast: "Wayne",
        });
        const token = registerRes.body.token;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const createOrderRes = getPostResponse(`/v1/${userId}/order/create`, {
            items: [
                { productId: "123ABC", name: "Laptop", price: 1000, quantity: 1 },
            ],
        });
        const orderId = createOrderRes.body.orderId;
        const res = getPutResponse(`/v1/${userId}/order/${orderId}/cancel`, {
            reason: "Changed my mind",
        });
        expect(res.body).toStrictEqual({ reason: "Changed my mind" });
        expect(res.statusCode).toBe(200);
    });
    test("unable to cancel error due to invalid userId", () => {
        const registerRes = getPostResponse("/v1/user/register", {
            email: "test@example.com",
            password: "securepassword123!",
            nameFirst: "Bruce",
            nameLast: "Wayne",
        });
        const token = registerRes.body.token;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const createOrderRes = getPostResponse(`/v1/${userId}/order/create`, {
            items: [
                { productId: "123ABC", name: "Laptop", price: 1000, quantity: 1 },
            ],
        });
        const orderId = createOrderRes.body.orderId;
        const res = getPutResponse(`/v1/${userId + 1000}/order/${orderId}/cancel`, {
            reason: "Changed my mind",
        });
        expect(res.body).toStrictEqual({ error: "invalid userId" });
        expect(res.statusCode).toBe(401);
    });
    test("unable to cancel error due to invalid orderId", () => {
        const registerRes = getPostResponse("/v1/user/register", {
            email: "test@example.com",
            password: "securepassword123!",
            nameFirst: "Bruce",
            nameLast: "Wayne",
        });
        const token = registerRes.body.token;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const createOrderRes = getPostResponse(`/v1/${userId}/order/create`, {
            items: [
                { productId: "123ABC", name: "Laptop", price: 1000, quantity: 1 },
            ],
        });
        const orderId = createOrderRes.body.orderId;
        const res = getPutResponse(`/v1/${userId}/order/${orderId + 1000}/cancel`, {
            reason: "Changed my mind",
        });
        expect(res.body).toStrictEqual({ error: "invalid orderId" });
        expect(res.statusCode).toBe(401);
    });
});
