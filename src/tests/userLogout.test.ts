import {
  userRegister,
  userDetails,
  reqHelper,
  userLogout,
} from './testHelper';
import { SessionId } from '../types';

beforeEach(() => {
  reqHelper('DELETE', '/v1/clear');
});

describe('userLogout', () => {
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

  test('A sucessful logout', () => {
    const resp = userLogout(tUser.token);
    expect(resp.body).toStrictEqual({});
    expect(resp.statusCode).toBe(200);
  });

  test('test logout with incorrect token', () => {
    const resp = userLogout(tUser.token + 1);
    expect(resp.body).toStrictEqual({
      error: expect.any(String),
    });
    expect(resp.statusCode).toBe(401);
  });

  test('can still login with token-did not delete sessionId', () => {
    const resp = userLogout(tUser.token);
    const check = userDetails(tUser.token).body;
    expect(check).toStrictEqual({
      error: expect.any(String),
    });
    expect(resp.statusCode).toBe(200);
  });
});
