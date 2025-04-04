import { userRegister } from '../user';
import { getAllUsers, addUser } from '../dataStore';
import { Err, ErrKind } from '../types'; 
import validator from 'validator'; 
import { server } from '../server';  


jest.mock('../dataStore', () => ({
  getAllUsers: jest.fn(),
  addUser: jest.fn(),
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

jest.mock('validator', () => ({
  isEmail: jest.fn(),
}));

describe('userRegister', () => {
  let mockExistingUsers: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistingUsers = [];
    (getAllUsers as jest.Mock).mockResolvedValue(mockExistingUsers);
  });

  afterAll(async () => {
    const redisClient = require('@redis/client').createClient();
    await redisClient.quit(); 
    server.close(); 
  });

  test('A user successfully registers', async () => {
    const email = 'testUser@email.com';
    const password = 'ValidPassword123';
    const nameFirst = 'John';
    const nameLast = 'Doe';
    
    (getAllUsers as jest.Mock).mockResolvedValue([]);
    (addUser as jest.Mock).mockResolvedValue(1); 
    (validator.isEmail as jest.Mock).mockReturnValue(true);

    const result = await userRegister(email, password, nameFirst, nameLast);

    expect(result).toEqual({ userId: 1 });
    expect(addUser).toHaveBeenCalledWith(expect.objectContaining({
      email,
      password: expect.any(String), 
      nameFirst,
      nameLast,
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    }));
  });

  test('If a user already has an email registered, it should return an error', async () => {
    const email = 'existinguser@email.com';
    const password = 'ValidPassword123';
    const nameFirst = 'Jane';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true); 
    
    mockExistingUsers = [{ email }];
    (getAllUsers as jest.Mock).mockResolvedValue(mockExistingUsers);

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('This email is already registered on another account', ErrKind.EINVALID));
  });

  test('User enters invalid Email', async () => {
    const email = 'invalidemail.com';
    const password = 'ValidPassword123';
    const nameFirst = 'John';
    const nameLast = 'Doe';
    
    (validator.isEmail as jest.Mock).mockReturnValue(false);

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('Email is invalid', ErrKind.EINVALID));
  });

  test('User enters invalid character in first name', async () => {
    const email = 'user@example.com';
    const password = 'ValidPassword123';
    const nameFirst = 'John@';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true);
    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('first name can only contain letters, spaces, hyphens, and apostrophes.', ErrKind.EINVALID));
  });

  test('User enters invalid last name', async () => {
    const email = 'user@email.com';
    const password = 'ValidPassword123';
    const nameFirst = 'John';
    const nameLast = ''; 

    (validator.isEmail as jest.Mock).mockReturnValue(true); 

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('last name must be between 2 and 20 characters long.', ErrKind.EINVALID));
  });

  test('User enters invalid password length', async () => {
    const email = 'user@email.com';
    const password = 'short'; 
    const nameFirst = 'John';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true);

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('new password does not contain a number!', ErrKind.EINVALID));
  });

  test('Password does not contain a number', async () => {
    const email = 'user@email.com';
    const password = 'NoNumbers'; 
    const nameFirst = 'John';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true); 

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('new password does not contain a number!', ErrKind.EINVALID));
  });

  test('Password does not contain a letter', async () => {
    const email = 'user@email.com';
    const password = '12345678'; 
    const nameFirst = 'John';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true);

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('new password does not contain a letter!', ErrKind.EINVALID));
  });

  test('Password is too short', async () => {
    const email = 'user@email.com';
    const password = 'Ab12345'; 
    const nameFirst = 'John';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true);

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('new password is less than 8 characters long!', ErrKind.EINVALID));
  });

  test('User enters invalid name size', async () => {
    const email = 'user@email.com';
    const password = 'ValidPassword123';
    const nameFirst = 'J';
    const nameLast = 'Doe';

    (validator.isEmail as jest.Mock).mockReturnValue(true); 

    await expect(userRegister(email, password, nameFirst, nameLast))
      .rejects
      .toThrowError(new Err('first name must be between 2 and 20 characters long.', ErrKind.EINVALID));
  });
});