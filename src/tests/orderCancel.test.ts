// import { beforeEach } from "node:test";
import { getPutResponse } from "../wrapper";
const SERVER_URL = `http://localhost:3000`;
const TIMEOUT_MS = 5 * 1000;

// beforeEach(() => {
//   request("DELETE", SERVER_URL + "/v1/clear", { timeout: TIMEOUT_MS });
// });

describe.skip("Order Cancel", () => {
  const userId = "1";
  const orderId = "order001";
  const reason = "Customer request";

  test("should cancel the order successfully", async () => {
    const body = {
      reason: reason,
    };

    const response = getPutResponse(
      `/v1/${userId}/order/${orderId}/cancel`,
      body
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ reason: "Customer request" });
  });

  test("should return an error if the order is already cancelled", async () => {
    const body = {
      reason: reason,
    };

    const response = getPutResponse(
      `/v1/${userId}/order/${orderId}/cancel`,
      body
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("order already cancelled");
  });
});
