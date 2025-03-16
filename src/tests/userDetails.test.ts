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
      email: 'brokenAhEmail@email.com',
      password: 'testpass1',
      nameFirst: 'first',
      nameLast: 'last',
      token: null as unknown as SessionId,
    };
    tUser.token = await userRegister(
      tUser.email,
      tUser.password,
      tUser.nameFirst,
      tUser.nameLast
    ).body.token;

    console.log('The token is: ' + tUser.token);
    const resp = await userDetails(tUser.token);
    const decoded: any = jwt.verify(tUser.token, process.env.JWT_SECRET as string);
    console.log('The exp is: ' + decoded.exp);
    console.log('The userId is: ' + decoded.userId);
    

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
