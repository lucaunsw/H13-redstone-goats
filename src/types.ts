export type UserId = number;
export type SessionId = string;

// Special Helper type as {} is ambiguous
export type EmptyObj = Record<string, never>;

export interface User {
  id?: number | null;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  streetName?: string;
  cityName?: string;
  postalZone?: string;
  cbcCode?: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface UserSimple {
  id?: number | null;
  name: string,
  streetName: string,
  cityName: string,
  postalZone: string,
  cbcCode: string
}

export interface Item {
  id?: number | null;
  name: string;
  seller: UserSimple;
  description?: string;
  price: number;
}

export interface ItemSales {
  id: number;
  name: string;
  description?: string;
  price: number;
  amountSold: number;
}

export interface BillingDetails {
  creditCardNumber: string;
  CVV: number;
  expiryDate: string;
}

export interface DeliveryInstructions {
  streetName: string;
  cityName: string;
  postalZone: string;
  countrySubentity: string;
  addressLine: string;
  cbcCode: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export enum status {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export interface Order {
  id?: number | null;
  items: Item[];
  quantities: number[];
  buyer: UserSimple;
  billingDetails: BillingDetails;
  delivery: DeliveryInstructions;
  lastEdited?: string;
  status?: status;
  totalPrice: number;
  createdAt: Date;
  orderXMLId?: number;
}

// Special error handling / other types
export enum ErrKind {
  EINVALID = 400,
  EACCESS = 403,
  ENOTOKEN = 401,
}

// We don't want this to be extensible
export type UserSummary = {
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
