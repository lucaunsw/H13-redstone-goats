export type UserId = number;
export type SessionId = string;

// Special Helper type as {} is ambiguous
export type EmptyObj = Record<string, never>;

export interface UserData {
  id?: number | null;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  //prevPasswords: Set<string>;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  createdAt: Date;
}

export interface User {
  userId: number;
  totalPrice: number;
}

export interface UserParam {
  userId: number;
  name: string;
}

export interface BillingDetailsParam {
  creditCardNumber: number;
  CVV: number;
  expiryDate: Date;
}

export interface OrderParam {
  items: Item[];
  user: UserParam;
  billingDetails: BillingDetailsParam;
  deliveryInstructions: string;
  lastEdited?: Date;
}

export interface OrderItem {
  orderId: number;
  itemId: number;
  quantity: number;
}

// Special error handling / other types
export enum ErrKind {
  EINVALID = 400,
  EACCESS = 403,
  ENOTOKEN = 401,
}

// We don't want this to be extensible
export type UserDataSummary = {
  userId: UserId;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
};

export class Err extends Error {
public readonly kind: ErrKind;

constructor(message: string, kind: ErrKind) {
    super(message);
    this.kind = kind;
    Error.captureStackTrace(this);
  }
}