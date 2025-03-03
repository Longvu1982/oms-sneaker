import logo from "@/assets/viet-sneaker-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar";
import useAuthStore from "@/store/auth";
import { Role } from "@/types/enum/app-enum";
import { Avatar, AvatarImage } from "../ui/avatar";
import MenuItem from "./menu-item/MenuItem";
import { TMenuItem } from "./menu-item/menuItems.type";

const menus: TMenuItem[] = [
  // { type: "single", title: "Trang chủ", link: "/route1" },
  {
    type: "collapsible",
    title: "Quản lý đơn hàng",
    items: [
      { title: "Danh sách đơn", link: "/order-list" },
      { title: "Đơn đến kho", link: "/landed-order-list" },
      { title: "Đơn đã giao", link: "/complete-order-list" },
      { title: "Đơn đã huỷ", link: "/cancel-order-list" },
    ],
    role: [],
  },
  {
    type: "collapsible",
    title: "Quản lý ngoại tệ",
    items: [
      { title: "Danh sách GD", link: "/transaction-list" },
      { title: "Bảng balance", link: "/transaction-balance" },
    ],
    role: [Role.ADMIN],
  },
  {
    type: "single",
    title: "Quản lý doanh thu",
    role: [Role.ADMIN],
    link: "/statistics",
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
    role: [Role.ADMIN, Role.USER],
  },
];

const MainSidebar = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.account?.role;

  return (
    <Sidebar>
      <div className="flex items-center gap-2 ml-4 py-4">
        <Avatar className="size-8">
          <AvatarImage src={logo} />
        </Avatar>
        <span className="font-semibold italic">Viet Sneaker</span>
      </div>
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
