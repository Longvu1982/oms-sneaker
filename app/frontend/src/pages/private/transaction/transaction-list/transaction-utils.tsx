import {
  BalanceNatureType,
  NatureType,
  TransactionType,
} from "@/types/enum/app-enum";

export const transactionTypeObject = {
  [TransactionType.BUY_CN]: {
    text: "Mua tệ",
    color: "#41c5ff",
  },
  [TransactionType.BUY_PP]: {
    text: "Mua PP",
    color: "#74b782",
  },
  [TransactionType.SELL_CN]: {
    text: "Bán tệ",
    color: "#f8942f",
  },
  [TransactionType.CANCELLED]: {
    text: "Cancel-hoàn",
    color: "#fe364a66",
  },
};

export const natureObject = {
  [NatureType.IN]: {
    text: "In",
    color: "#90EE90",
  },
  [NatureType.OUT]: {
    text: "Out",
    color: "#c16e79",
  },
};

export const balanceNatureObject = {
  [BalanceNatureType.IN]: {
    text: "In",
    color: "#90EE90",
  },
  [BalanceNatureType.PENDING]: {
    text: "Pending",
    color: "#f8942f",
  },
};
