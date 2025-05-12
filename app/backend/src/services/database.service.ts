import { RequestUser } from '../types/express';
import { db } from '../utils/db.server';

export const exportDatabaseData = async (requestUser: RequestUser) => {
  const adminId = requestUser?.id;

  const [users, accounts, orders, transactions, transfered, sources, shippingStores, transactionBalances] =
    await Promise.all([
      db.user.findMany({ where: { adminId } }),
      db.account.findMany({ where: { user: { adminId } } }),
      db.order.findMany({ where: { user: { adminId } } }),
      db.transaction.findMany({ where: { adminId } }),
      db.transfered.findMany({ where: { user: { adminId } } }),
      db.source.findMany({ where: { adminId } }),
      db.shippingStore.findMany({ where: { adminId } }),
      db.transactionBalance.findMany({ where: { adminId } }),
    ]);

  const data = {
    users,
    accounts,
    orders,
    transactions,
    transfered,
    sources,
    shippingStores,
    transactionBalances,
  };
  return data;
};

export const getLastBackupTime = async (requestUser: RequestUser) => {
  return db.backup.findFirst({ where: { adminId: requestUser?.id }, orderBy: { createdAt: 'desc' } });
};
