import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { SidebarMenuButton, useSidebar } from "../../ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { isActive as isActiveMenuItem } from "./menuItems.utils";
import { TMenuItem } from "./menuItems.type";
import useAuthStore from "@/store/auth";
import { Role } from "@/types/enum/app-enum";

interface CollapsibleMenuItemProps {
  title: string;
  items: TMenuItem[];
  level: number;
}

const getCollapsibleChildrenKeys = (items: TMenuItem[]) => {
  const keys: string[] = [];
  items.forEach((i) => {
    keys.push(i.link ?? "");
    if (i.items) {
      keys.push(...getCollapsibleChildrenKeys(i.items));
    }
  });
  return keys;
};

const CollapsibleMenuItem: FC<CollapsibleMenuItemProps> = ({
  title,
  items,
  level,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const role = user?.account?.role;

  useEffect(() => {
    if (
      getCollapsibleChildrenKeys(items).some((item) =>
        isActiveMenuItem(item, pathname)
      )
    ) {
      setIsOpen(true);
    }
  }, [items, pathname]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            level === 1 ? "" : "pl-2",
            "w-full h-8 justify-between"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <ChevronRight
            className={cn(!isOpen ? "" : "rotate-90", "transition-all")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 pl-1 space-y-1 w-4/5 border-l-[1px]">
        {items
          .filter((i) => !i.role?.length || i.role.includes(role as Role))
          .map((item) => {
            const itemType = item.type;
            if (itemType === "collapsible")
              return (
                <CollapsibleMenuItem
                  level={item.level}
                  title={item.title}
                  items={item.items ?? []}
                />
              );
            return (
              <SidebarMenuButton
                isActive={isActiveMenuItem(item.link ?? "", pathname)}
                key={item.link}
                onClick={
                  item.onClick ??
                  (() => {
                    navigate(item.link ?? "");
                    setOpenMobile(false);
                  })
                }
                className="w-full justify-start py-0 h-8"
              >
                {item.title}
              </SidebarMenuButton>
            );
          })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleMenuItem;
