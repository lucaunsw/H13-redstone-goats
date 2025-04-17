export type UserId = number;
export type SessionId = string;

// Special Helper type as {} is ambiguous
export type EmptyObj = Record<string, never>;

export interface UserV1 {
  id?: number | null;
  nameFirst: string;
  nameLast: string;
  email: string;
  phone?: string;
  password: string;
  streetName?: string;
  cityName?: string;
  postalZone?: string;
  cbcCode?: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface UserSimpleV1 {
  id?: number | null;
  name: string,
  streetName: string,
  cityName: string,
  postalZone: string,
  cbcCode: string
}

export interface UserSimpleV2 {
  id?: number | null;
  name: string,
  email: string,
  phone?: string,
  streetName: string,
  cityName: string,
  postalZone: string,
  cbcCode: string
}

export interface ItemV1 {
  id?: number | null;
  name: string;
  seller: UserSimpleV1;
  description?: string;
  price: number;
}

export interface ItemSalesV1 {
  id: number;
  name: string;
  description?: string;
  price: number;
  amountSold: number;
}

export interface ItemBuyerV2 {
  buyer: UserSimpleV2;
  quantity: number;
  status: status;
}

export interface BillingDetailsV1 {
  creditCardNumber: string;
  CVV: number;
  expiryDate: string;
}

export interface DeliveryInstructionsV1 {
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

export interface OrderV1 {
  id?: number | null;
  items: ItemV1[];
  quantities: number[];
  buyer: UserSimpleV1;
  billingDetails: BillingDetailsV1;
  delivery: DeliveryInstructionsV1;
  lastEdited?: string;
  status?: status;
  totalPrice: number;
  taxAmount?: number;
  createdAt: Date;
  orderXMLId?: number;
}

export interface OrderV2 {
  id?: number | null;
  items: ItemV1[];
  quantities: number[];
  buyer: UserSimpleV2;
  billingDetails: BillingDetailsV1;
  delivery: DeliveryInstructionsV1;
  lastEdited?: string;
  status?: status;
  totalPrice: number;
  taxAmount?: number;
  taxTotal?: number;
  currency: string;
  paymentAccountId: string;
  paymentAccountName: string;
  financialInstitutionBranchId: string;
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
export type UserSummaryV1 = {
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
