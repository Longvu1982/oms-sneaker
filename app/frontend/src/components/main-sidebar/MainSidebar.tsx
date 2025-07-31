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
    level: 1,
    items: [
      {
        type: "collapsible",
        title: "Đơn đang giao",
        link: "/order-list",
        level: 2,
        items: [
          { title: "Đang giao", link: "/order-list", type: "single", level: 3 },
          {
            title: "Đến kho TQ",
            link: "/landed-in-china",
            type: "single",
            level: 3,
          },
        ],
      },
      {
        title: "Đơn đến kho",
        link: "/landed-order-list",
        type: "single",
        level: 2,
      },
      {
        title: "Đơn đã giao",
        link: "/complete-order-list",
        type: "single",
        level: 2,
      },
      {
        title: "Đơn đã huỷ",
        link: "/cancel-order-list",
        type: "single",
        level: 2,
      },
    ],
    role: [Role.ADMIN, Role.USER],
  },
  {
    type: "collapsible",
    title: "Quản lý ngoại tệ",
    level: 1,
    items: [
      {
        title: "Danh sách GD",
        link: "/transaction-list",
        type: "single",
        level: 2,
      },
      {
        title: "Bảng balance",
        link: "/transaction-balance",
        type: "single",
        level: 2,
      },
      {
        title: "Phí vận hành",
        link: "/operational-cost",
        type: "single",
        level: 2,
      },
    ],
    role: [Role.ADMIN],
  },
  {
    type: "single",
    title: "Quản lý doanh thu",
    role: [Role.ADMIN],
    link: "/statistics",
    level: 1,
  },
  {
    type: "single",
    title: "Quản lý nguồn",
    link: "/source-list",
    role: [Role.ADMIN],
    level: 1,
  },
  {
    type: "single",
    title: "Quản lý kho",
    link: "/shipping-store-list",
    role: [Role.ADMIN],
    level: 1,
  },
  {
    type: "single",
    title: "Quản lý users",
    link: "/user-list",
    role: [Role.ADMIN, Role.USER, Role.SUPER_ADMIN],
    level: 1,
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
        <span className="font-semibold italic">Viet Deli</span>
      </div>
      <SidebarContent>
        <SidebarGroup className="space-y-1">
          {menus
            .filter(
              (item) => !item.role?.length || item.role.includes(role as Role)
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
