import { userRegister, userDetails, reqHelper } from './testHelper';
import { Err, SessionId, ErrKind } from '../types';
import { clearAll } from '../dataStore';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

beforeEach(() => {
  clearAll();
});

describe('userDetails', () => {
  test('Returns error given invalid token', async () => {
    const invalidToken = '201u3nfoafowjioj'; // Invalid token

    const resp = await userDetails(invalidToken);

    expect(resp.body).toStrictEqual({ error: expect.any(String) });
    expect(resp.statusCode).toStrictEqual(ErrKind.ENOTOKEN);
  });

  test('Returns correct values given Valid userId', async () => {
    const tUser = {
      email: 'me@email.com',
      password: 'testpass1',
      nameFirst: 'first',
      nameLast: 'last',
      token: null as unknown as SessionId,
    };
    tUser.token = userRegister(
      tUser.email,
      tUser.password,
      tUser.nameFirst,
      tUser.nameLast
    ).body.token;

    console.log('The token is: ' + tUser.token);
    const resp = await userDetails(tUser.token);

    expect(resp.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: tUser.nameFirst + ' ' + tUser.nameLast,
        email: tUser.email,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    });
  });
});
