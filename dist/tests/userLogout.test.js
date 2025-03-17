"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("./testHelper");
beforeEach(() => {
    (0, testHelper_1.reqHelper)('DELETE', '/v1/clear');
});
describe('userLogout', () => {
    const tUser = {
        email: 'me@email.com',
        initpass: 'Testpassword1',
        fName: 'firstOne',
        lName: 'lastOne',
        token: null,
    };
    beforeEach(() => {
        tUser.token = (0, testHelper_1.userRegister)(tUser.email, tUser.initpass, tUser.fName, tUser.lName).body.token;
    });
    test('A sucessful logout', () => {
        const resp = (0, testHelper_1.userLogout)(tUser.token);
        expect(resp.body).toStrictEqual({});
        expect(resp.statusCode).toBe(200);
    });
    test('test logout with incorrect token', () => {
        const resp = (0, testHelper_1.userLogout)(tUser.token + 1);
        expect(resp.body).toStrictEqual({
            error: expect.any(String),
        });
        expect(resp.statusCode).toBe(401);
    });
    test('can still login with token-did not delete sessionId', () => {
        const resp = (0, testHelper_1.userLogout)(tUser.token);
        const check = (0, testHelper_1.userDetails)(tUser.token).body;
        expect(check).toStrictEqual({
            error: expect.any(String),
        });
        expect(resp.statusCode).toBe(200);
    });
});
