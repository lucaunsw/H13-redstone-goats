import { userRegister, userLogin, userDetails, reqHelper } from './testHelper';
import { SessionId } from '../types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Mock dependencies
jest.mock('./testHelper', () => ({
  userRegister: jest.fn(),
  userLogin: jest.fn(),
  userDetails: jest.fn(),
  reqHelper: jest.fn(),
}));

beforeEach(async () => {
  (reqHelper as jest.Mock).mockResolvedValue({});
  await reqHelper('DELETE', '/v1/clear');
});

describe('userLogin', () => {
  beforeEach(() => {
    // Mock user registration response
    (userRegister as jest.Mock).mockResolvedValue({
      body: { token: 'mockedToken' },
    });

    // Mock user login response
    (userLogin as jest.Mock).mockResolvedValue({
      body: { token: 'mockedToken' },
      statusCode: 200,
    });

    // Mock user details response
    (userDetails as jest.Mock).mockResolvedValue({
      body: {
        user: {
          userId: 1,
          name: 'fname lname',
          email: 'example@email.com',
          numSuccessfulLogins: 2, // Register sets it to 1, then one successful login
          numFailedPasswordsSinceLastLogin: 0,
        },
      },
    });
  });

  test('should return userId for valid email and password', async () => {
    await userRegister('example@email.com', 'ExamplePass123', 'fname', 'lname');
    const result = await userLogin('example@email.com', 'ExamplePass123');
    expect(result.statusCode).toBe(200);

    const resp = await userDetails(result.body.token);
    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should return error for invalid email', async () => {
    (userLogin as jest.Mock).mockResolvedValue({
      body: { error: 'Invalid email' },
      statusCode: 400,
    });

    const loginResult = await userLogin('invalid@email.com', 'ExamplePass123');

    expect(loginResult.body).toStrictEqual({ error: 'Invalid email' });
    expect(loginResult.statusCode).toBe(400);
  });

  test('should return error for invalid password with valid email', async () => {
    (userLogin as jest.Mock).mockResolvedValue({
      body: { error: 'Incorrect password' },
      statusCode: 400,
    });

    const loginResult2 = await userLogin('example2@email.com', 'InvalidPass1');

    expect(loginResult2.body).toStrictEqual({ error: 'Incorrect password' });
    expect(loginResult2.statusCode).toBe(400);
  });

  test('should increment numSuccessfulLogins on successful login', async () => {
    (userDetails as jest.Mock).mockResolvedValue({
      body: {
        user: {
          userId: 1,
          name: 'fname lname',
          email: 'example3@email.com',
          numSuccessfulLogins: 4,
          numFailedPasswordsSinceLastLogin: 0,
        },
      },
    });

    const resp = await userDetails('mockedToken');

    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 4, // Register sets it to 1, 3 successful logins
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should reset numFailedPasswordsSinceLastLogin on successful login', async () => {
    (userDetails as jest.Mock).mockResolvedValue({
      body: {
        user: {
          userId: 1,
          name: 'fname lname',
          email: 'example4@email.com',
          numSuccessfulLogins: 2, // Register sets it to 1
          numFailedPasswordsSinceLastLogin: 0,
        },
      },
    });

    const resp = await userDetails('mockedToken');

    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', async () => {
    (userDetails as jest.Mock).mockResolvedValue({
      body: {
        user: {
          userId: 1,
          name: 'fname lname',
          email: 'example5@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 3,
        },
      },
    });

    const resp = await userDetails('mockedToken');

    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 3,
      },
    });
  });
});

