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
describe.skip("tests for orderConfirm", () => {
    test("should confirm an order successfully", () => {
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
        const confirmRes = getPostResponse(`/v1/${userId}/order/${orderId}/confirm`, {});
        expect(confirmRes.statusCode).toBe(200);
        expect(confirmRes.body).toStrictEqual({});
    });
    test("should return 400 if order is not found", () => {
        const registerRes = getPostResponse("/v1/user/register", {
            email: "test@example.com",
            password: "securepassword123!",
            nameFirst: "Bruce",
            nameLast: "Wayne",
        });
        const token = registerRes.body.token;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const invalidOrderId = "invalid-order-id";
        const res = getPostResponse(`/v1/${userId}/order/${invalidOrderId}/confirm`, {});
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ error: "invalid orderId" });
    });
    test("should return 401 for invalid userId", () => {
        const invalidUserId = "invalid-user";
        const orderId = "valid-order-id";
        const res = getPostResponse(`/v1/${invalidUserId}/order/${orderId}/confirm`, {});
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "invalid userId" });
    });
});
