import { userLogin } from '../user'; 
import { getAllUsersV1, updateUserV1 } from '../dataStoreV1'; 
import { Err, ErrKind } from '../types'; 
import { server } from '../server';  

const crypto = require('crypto');
const testEmail = 'painpain@email.com';
const testPassword = 'IwantToCrashOut1234!';

jest.mock('../dataStoreV1', () => ({
  getAllUsersV1: jest.fn(() => Promise.resolve([])), 
  updateUserV1: jest.fn(),
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

jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('hashedPassword'), 
  })),
}));


describe('userLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    const redisClient = require('@redis/client').createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('should return userId for valid email and password', async () => {
    const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 1 };

    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([validUser]);
    
    const result = await userLogin(testEmail, testPassword);

    expect(result).toEqual({ userId: validUser.id });
    expect(getAllUsersV1).toHaveBeenCalledTimes(1);
    expect(updateUserV1).toHaveBeenCalledTimes(1);  
    expect(updateUserV1).toHaveBeenCalledWith(validUser);
  });

  test('should return error for invalid email', async () => {
    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([]);

    await expect(userLogin(testEmail, testPassword)).rejects.toThrowError(new Err('Email address does not exist', ErrKind.EINVALID));
    expect(getAllUsersV1).toHaveBeenCalledTimes(1);
  });

  test('should return error for invalid password with valid email', async () => {
    const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
    
    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([validUser]);

    (crypto.createHash as jest.Mock).mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('wrongPasswordHash') 
    });

    await expect(userLogin(testEmail, testPassword)).rejects.toThrowError(new Err('Password does not match the provided email', ErrKind.EINVALID));
    expect(getAllUsersV1).toHaveBeenCalledTimes(1);
    expect(updateUserV1).toHaveBeenCalledTimes(1);  
    expect(updateUserV1).toHaveBeenCalledWith({ ...validUser, numFailedPasswordsSinceLastLogin: 1 });
  });

  test('should increment numSuccessfulLogins on successful login', async () => {
    const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
    
    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([validUser]);

    await userLogin(testEmail, testPassword);

    expect(updateUserV1).toHaveBeenCalledWith({ ...validUser, numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0 });
  });

  test('should reset numFailedPasswordsSinceLastLogin on successful login', async () => {
    const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 5, numSuccessfulLogins: 0 };
    
    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([validUser]);

    await userLogin(testEmail, testPassword);

    expect(updateUserV1).toHaveBeenCalledWith({ ...validUser, numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0 });
  });

  test('should increment numFailedPasswordsSinceLastLogin on unsuccessful login', async () => {
    const validUser = { id: 1, email: testEmail, password: 'hashedPassword', numFailedPasswordsSinceLastLogin: 0, numSuccessfulLogins: 0 };
    
    (getAllUsersV1 as jest.Mock).mockResolvedValueOnce([validUser]);

    (crypto.createHash as jest.Mock).mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('wrongPasswordHash') 
    });

    await expect(userLogin(testEmail, testPassword)).rejects.toThrowError(new Err('Password does not match the provided email', ErrKind.EINVALID));

    expect(updateUserV1).toHaveBeenCalledWith({ ...validUser, numFailedPasswordsSinceLastLogin: 1 });
  });
});
