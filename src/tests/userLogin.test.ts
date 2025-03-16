import { userRegister, userLogin, userDetails, reqHelper } from './testHelper';
import { SessionId } from '../types';
import { clearAll } from '../dataStore';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { resolveObjectURL } from 'buffer';
dotenv.config();

beforeEach(async () => {
  await reqHelper('DELETE', '/v1/clear');
});

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

  test('should return userId for valid email and password', async () => {
    const token = await userRegister('example@email.com', 'ExamplePass123', 'fname', 'lname').body.token;
    const result = await userLogin('example@email.com', 'ExamplePass123');
    const decoded = jwt.verify(result.body.token, process.env.JWT_SECRET as string) as { userId: number };
    expect(decoded.userId).toStrictEqual(expect.any(Number));
    expect(result.statusCode).toBe(200);
    const resp = userDetails(result.body.token);
    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 2, // 4 because Register sets it to 1
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should return error for invalid email', async () => {
    userRegister('example1@email.com', 'ExamplePass123', 'fname', 'lname')
    const loginResult = await userLogin('invalid@email.com', 'ExamplePass123');
    expect(loginResult.body).toStrictEqual({ error: expect.any(String) });
    expect(loginResult.statusCode).toBe(400);
  });

  test('should return error for invalid password with valid email', async () => {
    userRegister('example2@email.com', 'ExamplePass123', 'fname', 'lname');
    const loginResult2 = await userLogin('example2@email.com', 'InvalidPass1');
    expect(loginResult2.body).toStrictEqual({ error: expect.any(String) });
    expect(loginResult2.statusCode).toBe(400);
  });

  test('should increment numSuccessfulLogins on successful login', async () => {
    const token = await userRegister('example3@email.com', 'ExamplePass123', 'fname', 'lname').body.token;
    userLogin('example3@email.com', 'ExamplePass123');
    userLogin('example3@email.com', 'ExamplePass123');
    userLogin('example3@email.com', 'ExamplePass123');
    // const decoded = jwt.decode(tUser.token);
    // console.log(decoded);
    const resp = await userDetails(token);
    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 4, // 4 because Register sets it to 1
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should reset numFailedPasswordsSinceLastLogin on successful login',  async () => {
    userRegister('example4@email.com', 'ExamplePass123', 'fname', 'lname');
    userLogin('example4@email.com', 'Badpassword1');
    userLogin('example4@email.com', 'Badpassword1');
    const token = userLogin('example4@email.com', 'ExamplePass123').body.token;
    const resp = await userDetails(token);
    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 2, // Register sets it to 1
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', async () => {
    const token = await userRegister('example5@email.com', 'ExamplePass123', 'fname', 'lname').body.token;
    userLogin('example5@email.com', 'Badpassword1');
    userLogin('example5@email.com', 'Badpassword1');
    userLogin('example5@email.com', 'Badpassword1');
    const resp = await userDetails(token);
    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 1, // Register sets it to 1
        numFailedPasswordsSinceLastLogin: 3,
      },
    });
  });
});
