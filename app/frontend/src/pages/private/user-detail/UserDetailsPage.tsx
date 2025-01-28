import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTriggerLoading } from "@/hooks/use-trigger-loading";
import { cn, formatAmount } from "@/lib/utils";
import { getUserById, UserExtra } from "@/services/main/userServices";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TransfersTimeline } from "./TransferTimeline";
import TransactionTable from "../transaction/transaction-list/table/TransactionTable";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState<UserExtra>();
  const { triggerLoading } = useTriggerLoading();
  const navigate = useNavigate();

  useEffect(() => {
    triggerLoading(async () => {
      if (userId) {
        const { data } = await getUserById(userId);
        if (data.success) {
          setUserData(data.data);
        }
      }
    });
  }, [userId]);

  if (!userData) return <></>;

  return (
    <div>
      <Button
        variant="link"
        className="px-0 mb-6"
        onClick={() => navigate("/user-list")}
      >
        <ChevronLeft />
        <span>Quay về danh sách</span>
      </Button>
      <div className="container mx-auto space-y-8">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
          Chi tiết người dùng
        </h3>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>
                    {userData.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xl font-semibold">{userData.fullName}</h4>
                  <p className="text-gray-500">{userData.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Điện thoại:</strong> {userData.phone || "N/A"}
                </p>
                <p>
                  <strong>Tài khoản:</strong>{" "}
                  {userData.account?.username ?? "N/A"}
                </p>
                <p>
                  <strong>Loại tài khoản:</strong>{" "}
                  {userData.account?.role ?? "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Tổng quan tài chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Đơn hàng</p>
                  <p className="text-2xl font-semibold">
                    {userData.orderCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đã chuyển</p>
                  <p className="text-2xl font-semibold">
                    {formatAmount(userData.transfered)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số dư</p>
                  <p
                    className={cn(
                      "text-2xl font-semibold",
                      userData.balance < 0 ? "text-red-500" : "text-green-600"
                    )}
                  >
                    {formatAmount(userData.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Lịch sử giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransfersTimeline transfers={userData.transfers} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Danh sách giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactionList={userData.transactions}
                manualPagination={false}
              />
            </CardContent>
          </Card>
        </section>
        {/* <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.orderCount === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Dữ liệu đơn hàng sẽ hiển thị ở đây
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section> */}
      </div>
    </div>
  );
};

export default UserDetailsPage;
