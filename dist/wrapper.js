"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGetResponse = getGetResponse;
exports.getPutResponse = getPutResponse;
exports.getPostResponse = getPostResponse;
exports.getDeleteResponse = getDeleteResponse;
/**
 * Import Functions Here
 */
const sync_request_curl_1 = __importDefault(require("sync-request-curl"));
const SERVER_URL = `http://localhost:3000`;
const TIMEOUT_MS = 20 * 1000;
function getGetResponse(route, body) {
    const res = (0, sync_request_curl_1.default)("GET", SERVER_URL + route, {
        qs: body,
        timeout: TIMEOUT_MS,
    });
    return {
        body: JSON.parse(res.body.toString()),
        statusCode: res.statusCode,
    };
}
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
function getDeleteResponse(route, body) {
    const res = (0, sync_request_curl_1.default)("DELETE", SERVER_URL + route, {
        qs: body,
        timeout: TIMEOUT_MS,
    });
    return {
        body: JSON.parse(res.body.toString()),
        statusCode: res.statusCode,
    };
}
