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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testHelper_1.reqHelper)('DELETE', '/v1/clear');
}));
describe('userRegister', () => {
    const tUser = {
        email: 'me@email.com',
        initpass: 'testpass1',
        fName: 'firstOne',
        lName: 'lastOne',
        token: null,
    };
    const tUser2 = {
        email: 'me@email.com',
        initpass: 'testpass2',
        fName: 'firstTwo',
        lName: 'lastTwo',
        token: null,
    };
    // beforeEach(async () => {
    //   const resp = await userRegister(
    //     tUser.email,
    //     tUser.initpass,
    //     tUser.fName,
    //     tUser.lName
    //   );
    //   tUser.token = resp.body.token;
    // });
    test('A user successfully registers', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)(`testEmail_${Date.now()}@email.com`, `example123`, `firstName`, `lastName`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toStrictEqual({ token: expect.any(String) });
        console.log("The token is: " + resp.body.token);
        const decoded = jsonwebtoken_1.default.verify(resp.body.token, process.env.JWT_SECRET);
        expect(typeof decoded.userId).toBe('number');
        console.log("The userId is: " + decoded.userId);
    }));
    test('If a user already has an email registered, it should return an error', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelper_1.userRegister)(tUser.email, tUser.initpass, tUser.fName, tUser.lName);
        const resp2 = yield (0, testHelper_1.userRegister)(tUser2.email, tUser2.initpass, tUser2.fName, tUser2.lName);
        expect(resp2.statusCode).toBe(400);
        expect(resp2.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid Email', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('me', tUser2.initpass, tUser2.fName, tUser2.lName);
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid character in first name', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail1@email.com', 'ExamplePassword1', 'John@doe', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid last name', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail2@email.com', 'ExamplePassword2', 'firstname', 'last@name');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid password length', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail3@email.com', 'Hi5', 'firstname', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Password does not contain a number', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail4@email.com', 'ExamplePassword', 'firstname', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Password does not contain a number', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail5@email.com', 'examplepassword', 'firstname', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('Password does not contain a letter', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail6@email.com', '12345678', 'firstname', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid name size', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail7@email.com', 'ExamplePassword1', 'p', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
    test('User enters invalid name size', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, testHelper_1.userRegister)('testemail8@email.com', 'ExamplePassword1', 'aaaaaaaaaaaaaaaaaaaaaaaaa', 'lastname');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toStrictEqual({ error: expect.any(String) });
    }));
});
