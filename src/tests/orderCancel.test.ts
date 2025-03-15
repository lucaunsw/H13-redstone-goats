import request from "sync-request-curl";
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function getPutResponse(route: string, body: { [key: string]: unknown }) {
  const res = request("PUT", SERVER_URL + route, {
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
})

export function getPostResponse(
  route: string,
  body: { [key: string]: unknown }
) {
  const res = request("POST", SERVER_URL + route, {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
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