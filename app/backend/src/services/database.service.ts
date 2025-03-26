import { db } from '../utils/db.server';

export const exportDatabaseData = async () => {
  const [users, accounts, orders, transactions, transfered, sources, shippingStores, transactionBalances] =
    await Promise.all([
      db.user.findMany(),
      db.account.findMany(),
      db.order.findMany(),
      db.transaction.findMany(),
      db.transfered.findMany(),
      db.source.findMany(),
      db.shippingStore.findMany(),
      db.transactionBalance.findMany(),
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

export const getLastBackupTime = async () => {
  return db.backup.findFirst({ orderBy: { createdAt: 'desc' } });
};
