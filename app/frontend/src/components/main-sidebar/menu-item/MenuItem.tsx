import { FC } from "react";
import CollapsibleMenuItem from "./CollapsibleMenuItem";
import SingleMenuItem from "./SingleMenuItem";
import { TMenuItem } from "./menuItems.type";

const MenuItem: FC<TMenuItem> = ({
  title,
  type,
  link = "",
  items = [],
  onClick,
}) => {
  if (type === "single")
    return <SingleMenuItem title={title} link={link} onClick={onClick} />;

  return <CollapsibleMenuItem items={items} title={title} />;
};

export default MenuItem;
