import { DeliveryCodeStatus, OrderStatus } from "@/types/enum/app-enum";

export const deliveryCodeStatusObject = {
  [DeliveryCodeStatus.PENDING]: {
    text: "Chờ tạo",
    color: "#ffcc00",
  },
  [DeliveryCodeStatus.EXIST]: {
    text: "Chờ nhận",
    color: "#ADD8E6",
  },
  [DeliveryCodeStatus.DELIVERD]: {
    text: "Đã nhận",
    color: "#6dc657",
  },
};

export const orderStatusObject = {
  [OrderStatus.ONGOING]: {
    text: "Đang giao",
    color: "#ffcc00",
  },
  [OrderStatus.LANDED]: {
    text: "Đã đến kho VN",
    color: "#ADD8E6",
  },
  [OrderStatus.LANDED_IN_CHINA]: {
    text: "Đã đến kho TQ",
    color: "violet",
  },
  [OrderStatus.SHIPPED]: {
    text: "Đã giao",
    color: "#6dc657",
  },
  [OrderStatus.CANCELLED]: {
    text: "Đã huỷ",
    color: "#fe364a66",
  },
};
