
import { userRegister } from './testHelper';
import { SessionId } from '../types';
import { getGetResponse } from '../wrapper';

const SERVER_URL = `http://127.0.0.1:3200`;
const TIMEOUT_MS = 20 * 1000;

// let user: {body: { token: SessionId }};
let userId: number;

beforeEach(() => {
  // clear function
  userId = JSON.parse(userRegister(
	  'BobbyJones@gmail.com',
	  'cake',
	  'Bobby',
	  'Jones}').body.token).userId;
});

describe.skip('Order user sales send', () => {

    test('Error from invalid token', () => {
    const invalidUserId = userId + 1; 
    const response = getGetResponse(`/v1/order/${invalidUserId}/sales`, {
        CSV: true,
        JSON: true,
        PDF: true,
    });

    expect(response.statusCode).toBe(400);
  });

  test('Success case: Returns empty sales', () => {


    const response = getGetResponse(`/v1/order/${userId}/sales`, {
      CSV: true,
      JSON: true,
      PDF: true,
    });
    
    // requestUserSales(true, true, true, user.body.token);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({sales: [], 
	  url: expect.any(String)});
	
  });

  
});



