import {
  userRegister,
  userDetails,
  userDetailsUpdate,
  reqHelper,
} from './testHelper';
import { SessionId } from '../types';

beforeEach(() => {
  reqHelper('DELETE', '/v1/clear');
});

describe.skip('Test userDetailsUpdate', () => {
  const tUser = {
    email: 'user@email.com',
    password: 'testpass1',
    nameFirst: 'Max',
    nameLast: 'Silverhammer',
    token: null as unknown as SessionId,
  };
  const tUser2 = {
    email: 'user2@email.com',
    password: 'testpass2',
    nameFirst: 'Uno',
    nameLast: 'Double',
    token: null as unknown as SessionId,
  };

  beforeEach(() => {
    tUser.token = userRegister(
      tUser.email,
      tUser.password,
      tUser.nameFirst,
      tUser.nameLast
    ).body.token;
    tUser2.token = userRegister(
      tUser2.email,
      tUser2.password,
      tUser2.nameFirst,
      tUser2.nameLast
    ).body.token;
  });

  test('Returns Correctly Given Valid authUserId', () => {
    expect(
      userDetailsUpdate(tUser.token, 'newmail@gmail.com', 'Jason', 'Pavement').body
    ).toStrictEqual({});
    expect(userDetails(tUser.token).body).toStrictEqual({
      user: {
        userId: expect.anything(),
        name: 'Jason' + ' ' + 'Pavement',
        email: 'newmail@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    });
  });

  test('Returns Error Given Invalid User', () => {
    expect(
      userDetailsUpdate(
        tUser.token + tUser2.token + 1,
        tUser.email,
        'nameFirst',
        'nameLast'
      ).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error When Email Owned By Other User', () => {
    expect(
      userDetailsUpdate(tUser.token, tUser2.email, tUser.nameFirst, tUser.nameLast).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error Given Invalid email', () => {
    expect(
      userDetailsUpdate(tUser.token, 'badstring', tUser.nameFirst, tUser.nameLast).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error given invalid nameFirst', () => {
    expect(
      userDetailsUpdate(tUser.token, tUser.email, 'Nam3F1rst!!', tUser.nameLast).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error Given nameFirst > 20 Char', () => {
    expect(
      userDetailsUpdate(
        tUser.token,
        tUser.email,
        'looooooooooooooooooongggName',
        tUser.nameLast
      ).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error Given nameFirst < 2 Char', () => {
    expect(
      userDetailsUpdate(tUser.token, tUser.email, 'p', tUser.nameLast).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error given invalid nameLast', () => {
    expect(
      userDetailsUpdate(tUser.token, tUser.email, tUser.nameFirst, 'Nam3last!!!').body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error Given nameLast > 20 Char', () => {
    expect(
      userDetailsUpdate(
        tUser.token,
        tUser.email,
        tUser.nameFirst,
        'looooooooooooooooooongggName'
      ).body
    ).toStrictEqual({ error: expect.any(String) });
  });

  test('Returns Error Given nameLast < 2 Char', () => {
    expect(
      userDetailsUpdate(tUser.token, tUser.email, tUser.nameFirst, 'n').body
    ).toStrictEqual({ error: expect.any(String) });
  });
});
