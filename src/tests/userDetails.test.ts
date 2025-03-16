import { userRegister, userDetails, reqHelper } from './testHelper';
import { Err, SessionId, ErrKind } from '../types';
import { clearAll } from '../dataStore';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

beforeEach(async () => {
  await reqHelper('DELETE', '/v1/clear');
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
      email: `testEmail_${Date.now()}@email.com`,
      password: 'testpass1',
      nameFirst: 'Zachary',
      nameLast: 'Abran',
      token: null as unknown as SessionId,
    };
    const resp = await userRegister(tUser.email, tUser.password, tUser.nameFirst, tUser.nameLast);
    expect(resp.body).not.toStrictEqual({ error: expect.any(String) });
    const result = await userDetails(resp.body.token);
    expect(result.body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: tUser.nameFirst + ' ' + tUser.nameLast,
        email: tUser.email,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    });
  }, 10000);
});
