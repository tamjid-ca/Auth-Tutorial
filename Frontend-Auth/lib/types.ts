export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "admin" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface ProfileResponse {
  user: User;
}

export interface AdminResponse {
  message: string;
  admin: {
    id: string;
    role: string;
  };
}

export interface ApiValidationError {
  type?: string;
  value?: string;
  msg: string;
  path?: string;
  location?: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: ApiValidationError[];
  error?: string;
}

export interface Address {
  _id: string;
  user: string;
  label: "home" | "work" | "other";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressListResponse {
  count: number;
  addresses: Address[];
}

export interface AddressSingleResponse {
  message?: string;
  address: Address;
}

export interface AddressCreateInput {
  label?: "home" | "work" | "other";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface AddressUpdateInput {
  label?: "home" | "work" | "other";
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
