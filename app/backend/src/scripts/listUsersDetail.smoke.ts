import { Role } from '@prisma/client';
import { listUsersDetail } from '../services/user.service';
import { QueryDataModel } from '../types/general';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const base: QueryDataModel = {
    pagination: { pageSize: 10, pageIndex: 0, totalCount: 0 },
    searchText: '',
    filter: [] as unknown as [{ column: string; value: any | any[] }],
    sort: { column: 'balance', type: 'asc' },
    hideZeroUsers: false,
  };

  const superAdminUser = {
    account: { role: Role.SUPER_ADMIN },
  } as any;

  const case1 = await listUsersDetail(base, superAdminUser);
  assert(case1.totalCount >= case1.users.length, 'case1 invalid totalCount/users');

  const case2 = await listUsersDetail({ ...base, hideZeroUsers: true }, superAdminUser);
  assert(case2.totalCount >= case2.users.length, 'case2 invalid totalCount/users');

  const case3 = await listUsersDetail({ ...base, searchText: 'a' }, superAdminUser);
  assert(case3.totalCount >= case3.users.length, 'case3 invalid totalCount/users');

  const case4 = await listUsersDetail({ ...base, sort: { column: 'onGoingTotal', type: 'desc' } }, superAdminUser);
  assert(Array.isArray(case4.users), 'case4 users is not array');

  if (case1.users[0]?.id) {
    const case5 = await listUsersDetail(
      {
        ...base,
        filter: [{ column: 'id', value: [case1.users[0].id] }] as any,
      },
      superAdminUser
    );
    assert(
      case5.users.every((u) => u.id === case1.users[0].id),
      'case5 id filter mismatch'
    );
  }

  const case6 = await listUsersDetail(
    { ...base, pagination: { pageSize: 2, pageIndex: 1, totalCount: 0 } },
    superAdminUser
  );
  assert(case6.users.length <= 2, 'case6 pagination size exceeded');

  console.log('listUsersDetail smoke test passed');
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('listUsersDetail smoke test failed');
    console.error(error);
    process.exit(1);
  });
