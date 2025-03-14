import { userRegister, userLogin, userDetails, reqHelper } from './testHelper';
import { SessionId } from '../types';

beforeEach(() => {
  reqHelper('DELETE', '/v1/clear');
});

describe.skip('userLogin', () => {
  const tUser = {
    email: 'me@email.com',
    initpass: 'Testpassword1',
    fName: 'firstOne',
    lName: 'lastOne',
    token: null as unknown as SessionId,
  };

  beforeEach(() => {
    tUser.token = userRegister(
      tUser.email,
      tUser.initpass,
      tUser.fName,
      tUser.lName
    ).body.token;
  });

  test('should return authUserId for valid email and password', () => {
    const result = userLogin('me@email.com', 'Testpassword1');
    expect(result.body).not.toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toBe(200);
  });

  test('should return error for invalid email', () => {
    const loginResult = userLogin('invalid@email.com', tUser.initpass);
    expect(loginResult.body).toStrictEqual({ error: expect.any(String) });
    expect(loginResult.statusCode).toBe(400);
  });

  test('should return error for invalid password with valid email', () => {
    userRegister('example@email.com', 'ExamplePass123', 'fname', 'lname');
    const loginResult2 = userLogin('example@email.com', 'InvalidPass1');
    expect(loginResult2.body).toStrictEqual({ error: expect.any(String) });
    expect(loginResult2.statusCode).toBe(400);
  });

  test('should increment numSuccessfulLogins on successful login', () => {
    userLogin('me@email.com', 'Testpassword1');
    userLogin('me@email.com', 'Testpassword1');
    userLogin('me@email.com', 'Testpassword1');
    expect(userDetails(tUser.token).body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 4, // 4 because Register sets it to 1
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should reset numFailedPasswordsSinceLastLogin on successful login', () => {
    userLogin('me@email.com', 'Badpassword1');
    userLogin('me@email.com', 'Badpassword1');
    userLogin('me@email.com', 'Testpassword1');
    expect(userDetails(tUser.token).body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 2, // Register sets it to 1
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', () => {
    userLogin('me@email.com', 'Badpassword1');
    userLogin('me@email.com', 'Badpassword1');
    userLogin('me@email.com', 'Badpassword1');
    expect(userDetails(tUser.token).body).toStrictEqual({
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
