import request from "sync-request-curl";
const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;
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

describe.skip("orderCancel successful return", () => {
  test("should cancel an order successfully", () => {
    const userId = "user123";
    const orderId = "order123";

    const res = getPutResponse(`/v1/${userId}/order/${orderId}/cancel`, {
      reason: "Changed my mind",
    });

    expect(res.body).toStrictEqual({ reason: "Changed my mind" });
    expect(res.statusCode).toBe(200);
  });
});
