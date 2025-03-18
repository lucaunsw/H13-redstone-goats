import {
  userRegister,
  userDetails,
  reqHelper,
  userLogout,
} from './testHelper';
import { ErrKind, SessionId } from '../types';

beforeEach(async () => {
  await reqHelper('DELETE', '/v1/clear');
});

describe('userLogout', () => {
  const tUser = {
    email: 'me@email.com',
    initpass: 'Testpassword1',
    fName: 'firstOne',
    lName: 'lastOne',
    token: null as unknown as SessionId,
  };

  beforeEach(async () => {
    tUser.token = await userRegister(
      tUser.email,
      tUser.initpass,
      tUser.fName,
      tUser.lName
    ).body.token;
  });

  test('A sucessful logout', async () => {
    const resp = await userLogout(tUser.token);
    expect(resp.body).toStrictEqual({});
    expect(resp.statusCode).toBe(200);
  });

  test('test logout with incorrect token', () => {
    const invalidToken = '201u3nfoafowjioj'; // Invalid token

    const resp = userLogout(invalidToken);
    expect(resp.body).toStrictEqual({
      error: expect.any(String),
    });
    expect(resp.statusCode).toBe(ErrKind.ENOTOKEN);
  });

  test('test if token got blacklisted after logout', () => {
    const resp = userLogout(tUser.token);
    const check = userDetails(tUser.token).body;
    expect(check).toStrictEqual({
      error: expect.any(String),
    });
    expect(resp.statusCode).toBe(200);
  });
});
