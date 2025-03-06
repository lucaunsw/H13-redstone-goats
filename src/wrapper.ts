/**
 * Import Functions Here
 */
import request from "sync-request-curl";

const SERVER_URL = `http://localhost:3000`;
const TIMEOUT_MS = 20 * 1000;

export function getGetResponse(
  route: string,
  body: { [key: string]: unknown }
) {
  const res = request("GET", SERVER_URL + route, {
    qs: body,
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function getPutResponse(
  route: string,
  body: { [key: string]: unknown }
) {
  const res = request("PUT", SERVER_URL + route, {
    json: body,
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

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

export function getDeleteResponse(
  route: string,
  body: { [key: string]: unknown }
) {
  const res = request("DELETE", SERVER_URL + route, {
    qs: body,
    timeout: TIMEOUT_MS,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}
