export type TMenuItemButton = {
  title: string;
  link: string;
  onClick?: () => void;
};

export type TMenuItem = {
  type: "single" | "collapsible";
  title: string;
  link?: string;
  items?: { title: string; link: string; onClick?: () => void }[];
  onClick?: () => void;
};
