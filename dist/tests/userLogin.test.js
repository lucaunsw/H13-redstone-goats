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
const crypto = require('crypto');
const testEmail = 'painpain@email.com';
const testPassword = 'IwantToCrashOut1234!';
jest.mock('../dataStore', () => ({
    getAllUsers: jest.fn(() => Promise.resolve([])),
    updateUser: jest.fn(),
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
jest.mock('crypto', () => ({
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedPassword'),
    })),
}));
describe('userLogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = require('@redis/client').createClient();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('should return userId for valid email and password', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 1 };
        dataStore_1.getAllUsers.mockResolvedValueOnce([validUser]);
        const result = yield (0, user_1.userLogin)(testEmail, testPassword);
        expect(result).toEqual({ userId: validUser.id });
        expect(dataStore_1.getAllUsers).toHaveBeenCalledTimes(1);
        expect(dataStore_1.updateUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.updateUser).toHaveBeenCalledWith(validUser);
    }));
    test('should return error for invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        dataStore_1.getAllUsers.mockResolvedValueOnce([]);
        yield expect((0, user_1.userLogin)(testEmail, testPassword)).rejects.toThrowError(new types_1.Err('Email address does not exist', types_1.ErrKind.EINVALID));
        expect(dataStore_1.getAllUsers).toHaveBeenCalledTimes(1);
    }));
    test('should return error for invalid password with valid email', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
        dataStore_1.getAllUsers.mockResolvedValueOnce([validUser]);
        crypto.createHash.mockReturnValueOnce({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('wrongPasswordHash')
        });
        yield expect((0, user_1.userLogin)(testEmail, testPassword)).rejects.toThrowError(new types_1.Err('Password does not match the provided email', types_1.ErrKind.EINVALID));
        expect(dataStore_1.getAllUsers).toHaveBeenCalledTimes(1);
        expect(dataStore_1.updateUser).toHaveBeenCalledTimes(1);
        expect(dataStore_1.updateUser).toHaveBeenCalledWith(Object.assign(Object.assign({}, validUser), { numFailedPasswordsSinceLastLogin: 1 }));
    }));
    test('should increment numSuccessfulLogins on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
        dataStore_1.getAllUsers.mockResolvedValueOnce([validUser]);
        yield (0, user_1.userLogin)(testEmail, testPassword);
        expect(dataStore_1.updateUser).toHaveBeenCalledWith(Object.assign(Object.assign({}, validUser), { numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0 }));
    }));
    test('should reset numFailedPasswordsSinceLastLogin on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 5, numSuccessfulLogins: 0 };
        dataStore_1.getAllUsers.mockResolvedValueOnce([validUser]);
        yield (0, user_1.userLogin)(testEmail, testPassword);
        expect(dataStore_1.updateUser).toHaveBeenCalledWith(Object.assign(Object.assign({}, validUser), { numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0 }));
    }));
    test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', () => __awaiter(void 0, void 0, void 0, function* () {
        const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
        dataStore_1.getAllUsers.mockResolvedValueOnce([validUser]);
        crypto.createHash.mockReturnValueOnce({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('wrongPasswordHash')
        });
        yield expect((0, user_1.userLogin)(testEmail, testPassword)).rejects.toThrowError(new types_1.Err('Password does not match the provided email', types_1.ErrKind.EINVALID));
        expect(dataStore_1.updateUser).toHaveBeenCalledWith(Object.assign(Object.assign({}, validUser), { numFailedPasswordsSinceLastLogin: 1 }));
    }));
});
