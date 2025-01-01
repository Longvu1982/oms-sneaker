import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import MenuItem from "./menu-item/MenuItem";
import { TMenuItem } from "./menu-item/menuItems.type";
import { Role } from "@/types/enum/app-enum";
import useAuthStore from "@/store/auth";

const menus: TMenuItem[] = [
  // { type: "single", title: "Trang chủ", link: "/route1" },
  {
    type: "collapsible",
    title: "Quản lý đơn hàng",
    items: [
      { title: "Danh sách đơn", link: "/order-list" },
      { title: "Đơn hoàn tất", link: "/complete-order-list" },
    ],
    role: [],
  },
  {
    type: "single",
    title: "Quản lý nguồn",
    link: "/source-list",
    role: [Role.ADMIN],
  },
  {
    type: "single",
    title: "Quản lý kho",
    link: "/shipping-store-list",
    role: [Role.ADMIN],
  },
  {
    type: "single",
    title: "Quản lý users",
    link: "/user-list",
    role: [Role.ADMIN],
  },
];

const MainSidebar = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.account?.role;

  return (
    <Sidebar>
      <SidebarHeader>OMS Viet Sneaker</SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-1">
          {menus
            .filter(
              (item) => !item.role.length || item.role.includes(role as Role)
            )
            .map((menu) => (
              <MenuItem {...menu} key={menu.title} />
            ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{/* Add footer content here */}</SidebarFooter>
    </Sidebar>
  );
};

export default MainSidebar;
