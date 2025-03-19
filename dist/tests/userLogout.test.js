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
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("./testHelper");
const types_1 = require("../types");
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testHelper_1.reqHelper)('DELETE', '/v1/clear');
}));
describe('userLogout', () => {
    const tUser = {
        email: 'me@email.com',
        initpass: 'Testpassword1',
        fName: 'firstOne',
        lName: 'lastOne',
        token: null,
    };
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        tUser.token = yield (0, testHelper_1.userRegister)(tUser.email, tUser.initpass, tUser.fName, tUser.lName).body.token;
    }));
    test('A sucessful logout', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userLogout)(tUser.token);
        expect(resp.body).toStrictEqual({});
        expect(resp.statusCode).toBe(200);
    }));
    test('test logout with incorrect token', () => {
        const invalidToken = '201u3nfoafowjioj'; // Invalid token
        const resp = (0, testHelper_1.userLogout)(invalidToken);
        expect(resp.body).toStrictEqual({
            error: expect.any(String),
        });
        expect(resp.statusCode).toBe(types_1.ErrKind.ENOTOKEN);
    });
    test('test if token got blacklisted after logout', () => {
        const resp = (0, testHelper_1.userLogout)(tUser.token);
        const check = (0, testHelper_1.userDetails)(tUser.token).body;
        expect(check).toStrictEqual({
            error: expect.any(String),
        });
        expect(resp.statusCode).toBe(200);
    });
});
