import { Button } from "@/components/ui/button";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isActive } from "./menuItems.utils";

interface SingleMenuItemProps {
  title: string;
  link: string;
  onClick?: () => void;
}

const SingleMenuItem: FC<SingleMenuItemProps> = ({ title, onClick, link }) => {
  const navigate = useNavigate();
  const onClickItem = onClick ?? (() => navigate(link));
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton
      isActive={isActive(link, pathname)}
      className="w-full justify-start"
      asChild
    >
      <Button
        onClick={() => {
          onClickItem();
          setOpenMobile(false);
        }}
        variant="ghost"
        className="w-full justify-between px-4"
      >
        {title}
      </Button>
    </SidebarMenuButton>
  );
};

export default SingleMenuItem;
