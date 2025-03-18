import { userRegister, reqHelper } from './testHelper';
import { SessionId } from '../types';
import { clearAll } from '../dataStore';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

beforeEach(async () => {
  await reqHelper('DELETE', '/v1/clear');
});

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
  
  test('A user successfully registers', async () => {
    const resp = await userRegister(`testemail@email.com`, `example123`, `firstName`, `lastName`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toStrictEqual({ token: expect.any(String) });
    const decoded = jwt.verify(resp.body.token, process.env.JWT_SECRET as string) as { userId: number };
    expect(typeof decoded.userId).toBe('number');
  });

  test('If a user already has an email registered, it should return an error', async () => {
    await userRegister(tUser.email, tUser.initpass, tUser.fName, tUser.lName);
    const resp2 = await userRegister(tUser2.email, tUser2.initpass, tUser2.fName, tUser2.lName);
    expect(resp2.statusCode).toBe(400);
    expect(resp2.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid Email', async () => {
    const resp = await userRegister('me', tUser2.initpass, tUser2.fName, tUser2.lName);
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid character in first name', async () => {
    const resp = await userRegister(
      'testemail@email.com',
      'ExamplePassword1',
      'John@doe',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid last name', async () => {
    const resp = await userRegister(
      'testemail@email.com',
      'ExamplePassword2',
      'firstname',
      'last@name'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid password length', async () => {
    const resp = await userRegister('testemail3@email.com', 'Hi5', 'firstname', 'lastname');
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Password does not contain a number', async () => {
    const resp = await userRegister(
      'testemail@email.com',
      'examplepassword',
      'firstname',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('Password does not contain a letter', async () => {
    const resp = await userRegister(
      'testemail@email.com',
      '12345678',
      'firstname',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });

  test('User enters invalid name size', async () => {
    const resp = await userRegister(
      'testemail8@email.com',
      'ExamplePassword1',
      'aaaaaaaaaaaaaaaaaaaaaaaaa',
      'lastname'
    );
    expect(resp.statusCode).toBe(400);
    expect(resp.body).toStrictEqual({ error: expect.any(String) });
  });
});
