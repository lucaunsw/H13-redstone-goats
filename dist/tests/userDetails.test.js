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
const dataStore_1 = require("../dataStore");
const types_1 = require("../types");
const server_1 = require("../server");
jest.mock('../dataStore', () => ({
    getUser: jest.fn(),
}));
jest.mock('@redis/client', () => ({
    createClient: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        on: jest.fn(),
        quit: jest.fn(),
    })),
}));
describe('userDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = require('@redis/client').createClient();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('Returns error if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = 999;
        dataStore_1.getUser.mockResolvedValueOnce(null);
        yield expect((0, user_1.userDetails)(invalidUserId)).rejects.toThrowError(new types_1.Err('User not found', types_1.ErrKind.EINVALID));
    }));
    test('Returns correct user details for valid userId', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUserId = 1;
        const mockUser = {
            userId: validUserId,
            nameFirst: 'John',
            nameLast: 'Doe',
            email: 'john.doe@example.com',
            numSuccessfulLogins: 5,
            numFailedPasswordsSinceLastLogin: 2,
        };
        dataStore_1.getUser.mockResolvedValueOnce(mockUser);
        const result = yield (0, user_1.userDetails)(validUserId);
        expect(result).toEqual({
            user: {
                userId: validUserId,
                name: 'John Doe',
                email: 'john.doe@example.com',
                numSuccessfulLogins: 5,
                numFailedPasswordsSinceLastLogin: 2,
            },
        });
    }));
});
