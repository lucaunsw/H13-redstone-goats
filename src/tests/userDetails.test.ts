import { userRegister, userDetails, reqHelper } from './testHelper';
import { SessionId } from '../types';

beforeEach(() => {
  reqHelper('DELETE', '/v1/clear');
});

describe.skip('userDetails', () => {
  test('Returns error given invalid token', () => {
    expect(userDetails('38178357023').body).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Returns correct values given Valid authUserId', () => {
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

    expect(userDetails(tUser.token).body).toStrictEqual({
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
