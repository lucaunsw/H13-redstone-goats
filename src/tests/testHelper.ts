import request from 'sync-request-curl';
import config from '../config.json';
import { HttpVerb, Options, Response } from 'sync-request-curl/dist/cjs/types';
import { EmptyObj, SessionId, UserV1, OrderV1 } from '../types';

const port = config.port;
const url = config.url;

export function reqHelper<BodyTyp>(
  method: HttpVerb,
  route: string,
  options?: Options
): Omit<Response, 'body'> & { body: BodyTyp } {
  const res = request(method, `${url}:${port}${route}`, {
    ...options,
    timeout: 15000,
  });
  return { ...res, body: JSON.parse(res.body.toString()) };
}

/////////////////////////////////////////////////////////////////////
//                                                                 //
//  HELPERS BELOW THIS LINE ARE SPECIALISED VARIANTS OF THE ABOVE  //
//                                                                 //
/////////////////////////////////////////////////////////////////////

export function userRegister<T = { token: SessionId }>(
  em: string,
  pass: string,
  nF: string,
  nL: string
) {
  return reqHelper<T>('POST', '/v1/user/register', {
    json: {
      email: em,
      password: pass,
      nameFirst: nF,
      nameLast: nL,
    },
  });
}

export function userLogin<T = { token: SessionId }>(em: string, pass: string) {
  return reqHelper<T>('POST', '/v1/user/login', {
    json: {
      email: em,
      password: pass,
    },
  });
}

export function userLogout<T = EmptyObj>(token: SessionId) {
  return reqHelper<T>('POST', '/v1/user/logout', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function userDetails<T = { user: UserV1 }>(token: SessionId) {
  return reqHelper<T>('GET', '/v1/user/details', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function userDetailsUpdate<T = EmptyObj>(
  tok: SessionId,
  em: string,
  nF: string,
  nL: string
) {
  return reqHelper<T>('PUT', '/v1/user/details', {
    headers: {
      token: tok,
    },
    json: {
      email: em,
      nameFirst: nF,
      nameLast: nL,
    },
  });
}

export async function requestOrderCreate(
  body: OrderV1,
) {
  const res = request("POST", `${url}:${port}/v1/order/create`, {
    json: body,
    timeout: 60 * 1000,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export async function requestOrderUserSales(
  csv: boolean, json: boolean, pdf: boolean, userId: number
) {
  const res = request("POST", `${url}:${port}/v1/order/${userId}/sales`, {
    qs: { csv, json, pdf },
    timeout: 20 * 1000,
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}