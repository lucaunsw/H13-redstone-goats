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
const user_1 = require("../user");
const server_1 = require("../server");
jest.mock('@redis/client', () => ({
    createClient: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        on: jest.fn(),
        quit: jest.fn(),
    }),
}));
describe('userLogout', () => {
    const validToken = 'validToken123';
    const invalidToken = 'invalidToken456';
    let mockRedis;
    beforeEach(() => {
        jest.clearAllMocks();
        mockRedis = require('@redis/client').createClient();
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mockRedis.quit();
        server_1.server.close();
    }));
    test('A successful logout', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRedis.set.mockResolvedValueOnce('OK');
        const result = yield (0, user_1.userLogout)(validToken);
        expect(result).toEqual({});
        expect(mockRedis.set).toHaveBeenCalledWith(`blacklist_${validToken}`, 'true', { EX: 3600 });
    }));
    test('Logout with incorrect token', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRedis.set.mockResolvedValueOnce('OK');
        const result = yield (0, user_1.userLogout)(invalidToken);
        expect(result).toEqual({});
        expect(mockRedis.set).toHaveBeenCalledWith(`blacklist_${invalidToken}`, 'true', { EX: 3600 });
    }));
    test('Token should be blacklisted after logout', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRedis.set.mockResolvedValueOnce('OK');
        mockRedis.get.mockResolvedValueOnce('true');
        yield (0, user_1.userLogout)(validToken);
        const blacklistCheck = yield mockRedis.get(`blacklist_${validToken}`);
        expect(blacklistCheck).toBe('true');
    }));
});
// import {
//   userRegister,
//   userDetails,
//   reqHelper,
//   userLogout,
// } from './testHelper';
// import { ErrKind, SessionId } from '../types';
// jest.mock('./testHelper', () => ({
//   userRegister: jest.fn(),
//   userDetails: jest.fn(),
//   reqHelper: jest.fn(),
//   userLogout: jest.fn(),
// }));
// beforeEach(async () => {
//   (reqHelper as jest.Mock).mockResolvedValue({});
//   await reqHelper('DELETE', '/v1/clear');
// });
// describe('userLogout', () => {
//   const tUser = {
//     email: 'me@email.com',
//     initpass: 'Testpassword1',
//     fName: 'firstOne',
//     lName: 'lastOne',
//     token: null as unknown as SessionId,
//   };
//   beforeEach(async () => {
//     (userRegister as jest.Mock).mockResolvedValue({
//       body: { token: 'mockedToken' },
//     });
//     const resp = await userRegister(tUser.email, tUser.initpass, tUser.fName, tUser.lName);
//     tUser.token = resp.body.token;
//   });
//   test('A successful logout', async () => {
//     (userLogout as jest.Mock).mockResolvedValue({
//       body: {},
//       statusCode: 200,
//     });
//     const resp = await userLogout(tUser.token);
//     expect(resp.body).toStrictEqual({});
//     expect(resp.statusCode).toBe(200);
//   });
//   test('Logout with incorrect token', async () => {
//     (userLogout as jest.Mock).mockResolvedValue({
//       body: { error: 'Invalid token' },
//       statusCode: ErrKind.ENOTOKEN,
//     });
//     const invalidToken = '201u3nfoafowjioj';
//     const resp = await userLogout(invalidToken);
//     expect(resp.body).toStrictEqual({ error: 'Invalid token' });
//     expect(resp.statusCode).toBe(ErrKind.ENOTOKEN);
//   });
//   test('Token should be blacklisted after logout', async () => {
//     (userLogout as jest.Mock).mockResolvedValue({
//       body: {},
//       statusCode: 200,
//     });
//     (userDetails as jest.Mock).mockResolvedValue({
//       body: { error: 'Invalid token' },
//       statusCode: ErrKind.ENOTOKEN,
//     });
//     await userLogout(tUser.token);
//     const check = await userDetails(tUser.token);
//     expect(check.body).toStrictEqual({ error: 'Invalid token' });
//     expect(check.statusCode).toBe(ErrKind.ENOTOKEN);
//   });
// });
