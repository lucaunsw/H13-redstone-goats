import { userRegister, reqHelper } from './testHelper';
import { SessionId } from '../types';
import { deleteUser, getUser } from '../dataStore';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// beforeEach(() => {
//   reqHelper('DELETE', '/v1/clear');
// });

describe('userRegister', () => {
  const tUser = {
    email: 'me@email.com',
    initpass: 'testpass1',
    fName: 'firstOne',
    lName: 'lastOne',
    token: null as unknown as SessionId,
  };
  const tUser2 = {
    email: 'me@email.com',
    initpass: 'testpass2',
    fName: 'firstTwo',
    lName: 'lastTwo',
    token: null as unknown as SessionId,
  };
  
  beforeEach(async () => {
    const resp = await userRegister(
      tUser.email,
      tUser.initpass,
      tUser.fName,
      tUser.lName
    );
    tUser.token = resp.body.token;
  });

  
test('A user successfully registers', async () => {
  const resp = await userRegister(`example10@email.com`, `example123`, `firstName`, `lastName`);
  // console.log('Token:', resp.body.token);
  expect(resp.statusCode).toBe(200);
  expect(resp.body).toStrictEqual({ token: expect.any(String) });

  const decoded = jwt.verify(resp.body.token, process.env.JWT_SECRET as string) as { userId: number };
  // console.log('Decoded token:', decoded);
  expect(typeof decoded.userId).toBe('number');
  // const validUser = await getUser(decoded.userId);
  // console.log(validUser); 
});

  test('If a user already has an email registered, it should return an error', async () => {
    const resp = await userRegister(tUser2.email, tUser2.initpass, tUser2.fName, tUser2.lName);
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid Email', async () => {
    const resp = await userRegister('me', tUser2.initpass, tUser2.fName, tUser2.lName);
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid character in first name', () => {
    const resp = userRegister(
      'testemail1@email.com',
      'ExamplePassword1',
      'John@doe',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid last name', () => {
    const resp = userRegister(
      'testemail2@email.com',
      'ExamplePassword2',
      'firstname',
      'last@name'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid password length', () => {
    const resp = userRegister('testemail3@email.com', 'Hi5', 'firstname', 'lastname');
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Password does not contain a number', () => {
    const resp = userRegister(
      'testemail4@email.com',
      'ExamplePassword',
      'firstname',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Password does not contain a number', () => {
    const resp = userRegister(
      'testemail5@email.com',
      'examplepassword',
      'firstname',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Password does not contain a letter', () => {
    const resp = userRegister(
      'testemail6@email.com',
      '12345678',
      'firstname',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid name size', () => {
    const resp = userRegister(
      'testemail7@email.com',
      'ExamplePassword1',
      'p',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid name size', () => {
    const resp = userRegister(
      'testemail8@email.com',
      'ExamplePassword1',
      'aaaaaaaaaaaaaaaaaaaaaaaaa',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });
});
