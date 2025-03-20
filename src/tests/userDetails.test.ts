import { userRegister, userDetails, reqHelper } from './testHelper';
import { ErrKind, SessionId } from '../types';
import dotenv from 'dotenv';

dotenv.config();

// Mock testHelper module
jest.mock('./testHelper', () => ({
  reqHelper: jest.fn(),
  userRegister: jest.fn(),
  userDetails: jest.fn(),
}));

beforeEach(() => {
  (reqHelper as jest.Mock).mockReturnValue({ statusCode: 200 });
  reqHelper('DELETE', '/v1/clear'); // No need for async/await
});

describe('userDetails', () => {
  test('Returns error given invalid token', () => {
    const invalidToken = 'invalidToken123';

    // Instant return value (no async delay)
    (userDetails as jest.Mock).mockReturnValue({
      body: { error: 'Invalid token' },
      statusCode: ErrKind.ENOTOKEN,
    });

    const resp = userDetails(invalidToken);

    expect(resp.body).toStrictEqual({ error: expect.any(String) });
    expect(resp.statusCode).toStrictEqual(ErrKind.ENOTOKEN);
  });

  test('Returns correct values given valid userId', () => {
    const email = `testUser_${Date.now()}@email.com`; // Unique email
    const password = 'StrongPass1!';
    const nameFirst = 'Zachary';
    const nameLast = 'Abran';
    const mockToken: SessionId = 'mockedToken123';

    // Instant return for userRegister
    (userRegister as jest.Mock).mockReturnValue({
      body: { token: mockToken },
      statusCode: 200,
    });

    // Instant return for userDetails
    (userDetails as jest.Mock).mockReturnValue({
      body: {
        user: {
          userId: 1,
          name: `${nameFirst} ${nameLast}`,
          email,
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 0,
        },
      },
      statusCode: 200,
    });

    // Simulate user registration
    const regResp = userRegister(email, password, nameFirst, nameLast);
    expect(regResp.body).toStrictEqual({ token: mockToken });

    // Fetch user details
    const detailsResp = userDetails(mockToken);
    expect(detailsResp.body).toStrictEqual({
      user: {
        userId: 1,
        name: `${nameFirst} ${nameLast}`,
        email,
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
});


