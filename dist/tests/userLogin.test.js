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
describe('userLogin', () => {
    // const tUser = {
    //   email: 'me@email.com',
    //   initpass: 'Testpassword1',
    //   fName: 'firstOne',
    //   lName: 'lastOne',
    //   token: null as unknown as SessionId,
    // };  
    // beforeEach(async () => {
    //   tUser.token = await userRegister(
    //     tUser.email,
    //     tUser.initpass,
    //     tUser.fName,
    //     tUser.lName
    //   ).body.token;
    // });
    test('should return userId for valid email and password', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelper_1.userRegister)('example@email.com', 'ExamplePass123', 'fname', 'lname');
        const result = yield (0, testHelper_1.userLogin)('example@email.com', 'ExamplePass123');
        const decoded = jsonwebtoken_1.default.verify(result.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toStrictEqual(expect.any(Number));
        expect(result.statusCode).toBe(200);
        const resp = yield (0, testHelper_1.userDetails)(result.body.token);
        expect(resp.body).toStrictEqual({
            user: {
                userId: expect.anything(),
                name: expect.any(String),
                email: expect.any(String),
                numSuccessfulLogins: 2, // 4 because Register sets it to 1
                numFailedPasswordsSinceLastLogin: 0,
            },
        });
    }));
    test('should return error for invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelper_1.userRegister)('example1@email.com', 'ExamplePass123', 'fname', 'lname');
        const loginResult = yield (0, testHelper_1.userLogin)('invalid@email.com', 'ExamplePass123');
        expect(loginResult.body).toStrictEqual({ error: expect.any(String) });
        expect(loginResult.statusCode).toBe(400);
    }));
    test('should return error for invalid password with valid email', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelper_1.userRegister)('example2@email.com', 'ExamplePass123', 'fname', 'lname');
        const loginResult2 = yield (0, testHelper_1.userLogin)('example2@email.com', 'InvalidPass1');
        expect(loginResult2.body).toStrictEqual({ error: expect.any(String) });
        expect(loginResult2.statusCode).toBe(400);
    }));
    test('should increment numSuccessfulLogins on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = yield (0, testHelper_1.userRegister)('example3@email.com', 'ExamplePass123', 'fname', 'lname').body.token;
        (0, testHelper_1.userLogin)('example3@email.com', 'ExamplePass123');
        (0, testHelper_1.userLogin)('example3@email.com', 'ExamplePass123');
        (0, testHelper_1.userLogin)('example3@email.com', 'ExamplePass123');
        // const decoded = jwt.decode(tUser.token);
        // console.log(decoded);
        const resp = yield (0, testHelper_1.userDetails)(token);
        expect(resp.body).toStrictEqual({
            user: {
                userId: expect.anything(),
                name: expect.any(String),
                email: expect.any(String),
                numSuccessfulLogins: 4, // 4 because Register sets it to 1
                numFailedPasswordsSinceLastLogin: 0,
            },
        });
    }));
    test('should reset numFailedPasswordsSinceLastLogin on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelper_1.userRegister)('example4@email.com', 'ExamplePass123', 'fname', 'lname');
        yield (0, testHelper_1.userLogin)('example4@email.com', 'Badpassword1');
        yield (0, testHelper_1.userLogin)('example4@email.com', 'Badpassword1');
        const token = yield (0, testHelper_1.userLogin)('example4@email.com', 'ExamplePass123').body.token;
        const resp = yield (0, testHelper_1.userDetails)(token);
        expect(resp.body).toStrictEqual({
            user: {
                userId: expect.anything(),
                name: expect.any(String),
                email: expect.any(String),
                numSuccessfulLogins: 2, // Register sets it to 1
                numFailedPasswordsSinceLastLogin: 0,
            },
        });
    }));
    test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', () => __awaiter(void 0, void 0, void 0, function* () {
        const token = yield (0, testHelper_1.userRegister)('example5@email.com', 'ExamplePass123', 'fname', 'lname').body.token;
        (0, testHelper_1.userLogin)('example5@email.com', 'Badpassword1');
        (0, testHelper_1.userLogin)('example5@email.com', 'Badpassword1');
        (0, testHelper_1.userLogin)('example5@email.com', 'Badpassword1');
        const resp = yield (0, testHelper_1.userDetails)(token);
        expect(resp.body).toStrictEqual({
            user: {
                userId: expect.anything(),
                name: expect.any(String),
                email: expect.any(String),
                numSuccessfulLogins: 1, // Register sets it to 1
                numFailedPasswordsSinceLastLogin: 3,
            },
        });
    }));
});
