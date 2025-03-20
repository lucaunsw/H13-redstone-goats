import {
  userRegister,
  userDetails,
  reqHelper,
  userLogout,
} from './testHelper';
import { ErrKind, SessionId } from '../types';

jest.mock('./testHelper', () => ({
  userRegister: jest.fn(),
  userDetails: jest.fn(),
  reqHelper: jest.fn(),
  userLogout: jest.fn(),
}));

beforeEach(async () => {
  (reqHelper as jest.Mock).mockResolvedValue({});
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
    (userRegister as jest.Mock).mockResolvedValue({
      body: { token: 'mockedToken' },
    });

    const resp = await userRegister(tUser.email, tUser.initpass, tUser.fName, tUser.lName);
    tUser.token = resp.body.token;
  });

  test('A successful logout', async () => {
    (userLogout as jest.Mock).mockResolvedValue({
      body: {},
      statusCode: 200,
    });

    const resp = await userLogout(tUser.token);
    expect(resp.body).toStrictEqual({});
    expect(resp.statusCode).toBe(200);
  });

  test('Logout with incorrect token', async () => {
    (userLogout as jest.Mock).mockResolvedValue({
      body: { error: 'Invalid token' },
      statusCode: ErrKind.ENOTOKEN,
    });

    const invalidToken = '201u3nfoafowjioj';
    const resp = await userLogout(invalidToken);

    expect(resp.body).toStrictEqual({ error: 'Invalid token' });
    expect(resp.statusCode).toBe(ErrKind.ENOTOKEN);
  });

  test('Token should be blacklisted after logout', async () => {
    (userLogout as jest.Mock).mockResolvedValue({
      body: {},
      statusCode: 200,
    });

    (userDetails as jest.Mock).mockResolvedValue({
      body: { error: 'Invalid token' },
      statusCode: ErrKind.ENOTOKEN,
    });

    await userLogout(tUser.token);
    const check = await userDetails(tUser.token);

    expect(check.body).toStrictEqual({ error: 'Invalid token' });
    expect(check.statusCode).toBe(ErrKind.ENOTOKEN);
  });
});

