export enum Role {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  USER = "USER",
}

export enum OrderStatus {
  ONGOING = "ONGOING",
  LANDED = "LANDED",
  SHIPPED = "SHIPPED",
  CANCELLED = "CANCELLED",
}

export enum DeliveryCodeStatus {
  PENDING = "PENDING",
  EXIST = "EXIST",
  DELIVERD = "DELIVERD",
}

export enum TransactionType {
  BUY_CN = "BUY_CN",
  SELL_CN = "SELL_CN",
  BUY_PP = "BUY_PP",
  CANCELLED = "CANCELLED",
}

export enum NatureType {
  IN = "IN",
  OUT = "OUT",
}

export enum BalanceNatureType {
  IN = "IN",
  PENDING = "PENDING",
}
