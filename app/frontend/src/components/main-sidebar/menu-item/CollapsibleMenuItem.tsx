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

interface CollapsibleMenuItemProps {
  title: string;
  items: { title: string; link: string; onClick?: () => void }[];
}

const CollapsibleMenuItem: FC<CollapsibleMenuItemProps> = ({
  title,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    if (items.some((item) => isActiveMenuItem(item.link, pathname))) {
      setIsOpen(true);
    }
  }, [items, pathname]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-8 justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <ChevronRight
            className={cn(!isOpen ? "" : "rotate-90", "transition-all")}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 pl-1 space-y-1 w-4/5 border-l-[1px]">
        {items.map((item) => (
          <SidebarMenuButton
            isActive={isActiveMenuItem(item.link, pathname)}
            key={item.link}
            onClick={
              item.onClick ??
              (() => {
                navigate(item.link);
                setOpenMobile(false);
              })
            }
            className="w-full justify-start py-0 h-8"
          >
            {item.title}
          </SidebarMenuButton>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleMenuItem;
