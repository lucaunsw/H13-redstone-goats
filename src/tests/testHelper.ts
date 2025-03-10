import request from 'sync-request-curl';
import config from '../config.json';
import { HttpVerb, Options, Response } from 'sync-request-curl/dist/cjs/types';
import {
  EmptyObj,
  SessionId,
  UserDataSummary,
} from '../types';

const port = config.port;
const url = config.url;

export function reqHelper<BodyTyp>(
  method: HttpVerb,
  route: string,
  options?: Options
): Omit<Response, 'body'> & { body: BodyTyp } {
  const res = request(method, `${url}:${port}${route}`, {
    ...options,
    timeout: 2000,
  });
  return { ...res, body: JSON.parse(res.body.toString()) };
}

/// //////////////////////////////////////////////////////////////////
//                                                                 //
/// / HELPERS BELOW THIS LINE ARE SPECIALISED VARIANTS OF THE ABOVE //
//                                                                 //
/// //////////////////////////////////////////////////////////////////

export function userRegister<T = { token: SessionId }>(
  em: string,
  pass: string,
  nF: string,
  nL: string
) {
  return reqHelper<T>('POST', '/v1/admin/auth/register', {
    json: {
      email: em,
      password: pass,
      nameFirst: nF,
      nameLast: nL,
    },
  });
}

export function userLogin<T = { token: SessionId }>(em: string, pass: string) {
  return reqHelper<T>('POST', '/v1/admin/auth/login', {
    json: {
      email: em,
      password: pass,
    },
  });
}

export function userLogout<T = EmptyObj>(token: SessionId) {
  return reqHelper<T>('POST', '/v2/admin/auth/logout', {
    headers: {
      token: token,
    },
  });
}

export function userDetails<T = { user: UserDataSummary }>(token: SessionId) {
  return reqHelper<T>('GET', '/v2/admin/user/details', {
    headers: {
      token: token,
    },
  });
}

export function userDetailsUpdate<T = EmptyObj>(
  tok: SessionId,
  em: string,
  nF: string,
  nL: string
) {
  return reqHelper<T>('PUT', '/v2/admin/user/details', {
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