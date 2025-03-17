"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reqHelper = reqHelper;
exports.userRegister = userRegister;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.userDetails = userDetails;
exports.userDetailsUpdate = userDetailsUpdate;
const sync_request_curl_1 = __importDefault(require("sync-request-curl"));
const config_json_1 = __importDefault(require("../config.json"));
const port = config_json_1.default.port;
const url = config_json_1.default.url;
function reqHelper(method, route, options) {
    const res = (0, sync_request_curl_1.default)(method, `${url}:${port}${route}`, Object.assign(Object.assign({}, options), { timeout: 15000 }));
    return Object.assign(Object.assign({}, res), { body: JSON.parse(res.body.toString()) });
}
/// //////////////////////////////////////////////////////////////////
//                                                                 //
/// / HELPERS BELOW THIS LINE ARE SPECIALISED VARIANTS OF THE ABOVE //
//                                                                 //
/// //////////////////////////////////////////////////////////////////
function userRegister(em, pass, nF, nL) {
    return reqHelper('POST', '/v1/user/register', {
        json: {
            email: em,
            password: pass,
            nameFirst: nF,
            nameLast: nL,
        },
    });
}
function userLogin(em, pass) {
    return reqHelper('POST', '/v1/user/login', {
        json: {
            email: em,
            password: pass,
        },
    });
}
function userLogout(token) {
    return reqHelper('POST', '/v2/admin/auth/logout', {
        headers: {
            token: token,
        },
    });
}
function userDetails(token) {
    return reqHelper('GET', '/v1/user/details', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
function userDetailsUpdate(tok, em, nF, nL) {
    return reqHelper('PUT', '/v2/admin/user/details', {
        headers: {
            token: tok,
        },
        json: {
            email: em,
            nameFirst: nF,
            nameLast: nL,
        },
    });
}
