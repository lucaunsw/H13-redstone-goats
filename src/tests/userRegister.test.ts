import { userRegister, reqHelper } from './testHelper';
import { SessionId } from '../types';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

jest.mock('./testHelper', () => ({
  userRegister: jest.fn(),
  reqHelper: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

beforeEach(async () => {
  (reqHelper as jest.Mock).mockResolvedValue({}); // Mock clear request
  await reqHelper('DELETE', '/v1/clear');
});

describe('userRegister', () => {
  const tUser = {
    email: 'me@email.com',
    initpass: 'testpass1',
    fName: 'firstOne',
    lName: 'lastOne',
    token: null as unknown as SessionId,
  };
  const tUser2 = {
    email: 'me@email.com',
    initpass: 'testpass2',
    fName: 'firstTwo',
    lName: 'lastTwo',
    token: null as unknown as SessionId,
  };

  test('A user successfully registers', async () => {
    const mockToken = 'mocked.jwt.token';
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 200,
      body: { token: mockToken },
    });

    (jwt.verify as jest.Mock).mockReturnValue({ userId: 123 });

    const resp = await userRegister('testemail@email.com', 'example123', 'firstName', 'lastName');

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toStrictEqual({ token: expect.any(String) });

    const decoded = jwt.verify(resp.body.token, process.env.JWT_SECRET as string);
    expect(decoded).toEqual({ userId: 123 });
  });

  test('If a user already has an email registered, it should return an error', async () => {
    (userRegister as jest.Mock)
      .mockResolvedValueOnce({ statusCode: 200, body: { token: 'mockedToken' } }) // First call
      .mockResolvedValueOnce({ statusCode: 400, body: { error: 'Email already in use' } }); // Second call

    await userRegister(tUser.email, tUser.initpass, tUser.fName, tUser.lName);
    const resp2 = await userRegister(tUser2.email, tUser2.initpass, tUser2.fName, tUser2.lName);

    expect(resp2.statusCode).toBe(400);
    expect(resp2.body).toStrictEqual({ error: 'Email already in use' });
  });

  test('User enters invalid Email', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Invalid email' },
    });

    const resp = await userRegister('me', tUser2.initpass, tUser2.fName, tUser2.lName);

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Invalid email' });
  });

  test('User enters invalid character in first name', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Invalid character in name' },
    });

    const resp = await userRegister('testemail@email.com', 'ExamplePassword1', 'John@doe', 'lastname');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Invalid character in name' });
  });

  test('User enters invalid last name', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Invalid character in name' },
    });

    const resp = await userRegister('testemail@email.com', 'ExamplePassword2', 'firstname', 'last@name');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Invalid character in name' });
  });

  test('User enters invalid password length', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Password too short' },
    });

    const resp = await userRegister('testemail3@email.com', 'Hi5', 'firstname', 'lastname');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Password too short' });
  });

  test('Password does not contain a number', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Password must contain a number' },
    });

    const resp = await userRegister('testemail@email.com', 'examplepassword', 'firstname', 'lastname');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Password must contain a number' });
  });

  test('Password does not contain a letter', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Password must contain a letter' },
    });

    const resp = await userRegister('testemail@email.com', '12345678', 'firstname', 'lastname');

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Password must contain a letter' });
  });

  test('User enters invalid name size', async () => {
    (userRegister as jest.Mock).mockResolvedValue({
      statusCode: 400,
      body: { error: 'Name too long' },
    });

    const resp = await userRegister(
      'testemail8@email.com',
      'ExamplePassword1',
      'aaaaaaaaaaaaaaaaaaaaaaaaa',
      'lastname'
    );

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: 'Name too long' });
  });
});
