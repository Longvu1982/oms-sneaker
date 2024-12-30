import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import MenuItem from "./menu-item/MenuItem";
import { TMenuItem } from "./menu-item/menuItems.type";

const menus: TMenuItem[] = [
  { type: "single", title: "Trang chủ", link: "/route1" },
  {
    type: "collapsible",
    title: "Quản lý đơn hàng",
    items: [
      { title: "Danh sách đơn", link: "/order-list" },
      { title: "Đơn hoàn tất", link: "/complete-order-list" },
    ],
  },
];

const MainSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>OMS Viet Sneaker</SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-1">
          {menus.map((menu) => (
            <MenuItem {...menu} key={menu.title} />
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{/* Add footer content here */}</SidebarFooter>
    </Sidebar>
  );
};

export default MainSidebar;
