import { Role } from "@/types/enum/app-enum";

export type TMenuItemButton = {
  title: string;
  link: string;
  onClick?: () => void;
};

export type TMenuItem = {
  type: "single" | "collapsible";
  title: string;
  link?: string;
  items?: TMenuItem[];
  onClick?: () => void;
  role?: Role[];
  level: number;
};
