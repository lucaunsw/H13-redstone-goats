import { userDetails } from '../user';
import { getUserV1 } from '../dataStoreV1';
import { Err, ErrKind } from '../types'; 
import { server } from '../server';  
jest.mock('../dataStoreV1', () => ({
  getUserV1: jest.fn(),
}));

jest.mock('@redis/client', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  })),
}));

describe('userDetails', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const redisClient = require('@redis/client').createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('Returns error if user not found', async () => {
    const invalidUserId = 999; 
    
    (getUserV1 as jest.Mock).mockResolvedValueOnce(null);
    
    await expect(userDetails(invalidUserId)).rejects.toThrowError(
      new Err('User not found', ErrKind.EINVALID)
    );
  });

  test('Returns correct user details for valid userId', async () => {
    const validUserId = 1;
    const mockUser = {
      userId: validUserId,
      nameFirst: 'John',
      nameLast: 'Doe',
      email: 'john.doe@example.com',
      numSuccessfulLogins: 5,
      numFailedPasswordsSinceLastLogin: 2,
    };

    (getUserV1 as jest.Mock).mockResolvedValueOnce(mockUser);

    const result = await userDetails(validUserId);

    expect(result).toEqual({
      user: {
        userId: validUserId,
        name: 'John Doe', 
        email: 'john.doe@example.com',
        numSuccessfulLogins: 5,
        numFailedPasswordsSinceLastLogin: 2,
      },
    });
  });
});