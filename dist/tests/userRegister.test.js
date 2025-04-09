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
const user_1 = require("../user");
const dataStore_1 = require("../dataStore");
const types_1 = require("../types");
const validator_1 = __importDefault(require("validator"));
const server_1 = require("../server");
jest.mock('../dataStore', () => ({
    getAllUsers: jest.fn(),
    addUser: jest.fn(),
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
jest.mock('validator', () => ({
    isEmail: jest.fn(),
}));
describe('userRegister', () => {
    let mockExistingUsers;
    beforeEach(() => {
        jest.clearAllMocks();
        mockExistingUsers = [];
        dataStore_1.getAllUsers.mockResolvedValue(mockExistingUsers);
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const redisClient = require('@redis/client').createClient();
        yield redisClient.quit();
        server_1.server.close();
    }));
    test('A user successfully registers', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'testUser@email.com';
        const password = 'ValidPassword123';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        dataStore_1.getAllUsers.mockResolvedValue([]);
        dataStore_1.addUser.mockResolvedValue(1);
        validator_1.default.isEmail.mockReturnValue(true);
        const result = yield (0, user_1.userRegister)(email, password, nameFirst, nameLast);
        expect(result).toEqual({ userId: 1 });
        expect(dataStore_1.addUser).toHaveBeenCalledWith(expect.objectContaining({
            email,
            password: expect.any(String),
            nameFirst,
            nameLast,
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
        }));
    }));
    test('If a user already has an email registered, it should return an error', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'existinguser@email.com';
        const password = 'ValidPassword123';
        const nameFirst = 'Jane';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        mockExistingUsers = [{ email }];
        dataStore_1.getAllUsers.mockResolvedValue(mockExistingUsers);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('This email is already registered on another account', types_1.ErrKind.EINVALID));
    }));
    test('User enters invalid Email', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'invalidemail.com';
        const password = 'ValidPassword123';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(false);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('Email is invalid', types_1.ErrKind.EINVALID));
    }));
    test('User enters invalid character in first name', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@example.com';
        const password = 'ValidPassword123';
        const nameFirst = 'John@';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('first name can only contain letters, spaces, hyphens, and apostrophes.', types_1.ErrKind.EINVALID));
    }));
    test('User enters invalid last name', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = 'ValidPassword123';
        const nameFirst = 'John';
        const nameLast = '';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('last name must be between 2 and 20 characters long.', types_1.ErrKind.EINVALID));
    }));
    test('User enters invalid password length', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = 'short';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('new password does not contain a number!', types_1.ErrKind.EINVALID));
    }));
    test('Password does not contain a number', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = 'NoNumbers';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('new password does not contain a number!', types_1.ErrKind.EINVALID));
    }));
    test('Password does not contain a letter', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = '12345678';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('new password does not contain a letter!', types_1.ErrKind.EINVALID));
    }));
    test('Password is too short', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = 'Ab12345';
        const nameFirst = 'John';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('new password is less than 8 characters long!', types_1.ErrKind.EINVALID));
    }));
    test('User enters invalid name size', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'user@email.com';
        const password = 'ValidPassword123';
        const nameFirst = 'J';
        const nameLast = 'Doe';
        validator_1.default.isEmail.mockReturnValue(true);
        yield expect((0, user_1.userRegister)(email, password, nameFirst, nameLast))
            .rejects
            .toThrowError(new types_1.Err('first name must be between 2 and 20 characters long.', types_1.ErrKind.EINVALID));
    }));
});
