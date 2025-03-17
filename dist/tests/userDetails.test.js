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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("./testHelper");
const types_1 = require("../types");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testHelper_1.reqHelper)('DELETE', '/v1/clear');
}));
describe('userDetails', () => {
    test('Returns error given invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidToken = '201u3nfoafowjioj'; // Invalid token
        const resp = yield (0, testHelper_1.userDetails)(invalidToken);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
        expect(resp.statusCode).toStrictEqual(types_1.ErrKind.ENOTOKEN);
    }));
    test('Returns correct values given Valid userId', () => __awaiter(void 0, void 0, void 0, function* () {
        const tUser = {
            email: `testEmail_${Date.now()}@email.com`,
            password: 'testpass1',
            nameFirst: 'Zachary',
            nameLast: 'Abran',
            token: null,
        };
        const resp = yield (0, testHelper_1.userRegister)(tUser.email, tUser.password, tUser.nameFirst, tUser.nameLast);
        expect(resp.body).not.toStrictEqual({ error: expect.any(String) });
        const result = yield (0, testHelper_1.userDetails)(resp.body.token);
        expect(result.body).toStrictEqual({
            user: {
                userId: expect.anything(),
                name: tUser.nameFirst + ' ' + tUser.nameLast,
                email: tUser.email,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            },
        });
    }), 10000);
});
