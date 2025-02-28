import { DeliveryCodeStatus, OrderStatus, Role } from '@prisma/client';
import { v4 as uuidv4, v4 } from 'uuid';
import { TUserRegisterWrite } from '../src/types/general';
import { db } from '../src/utils/db.server';
import { hashPassword } from './../src/utils/bcryptHandler';

async function getUser(): Promise<TUserRegisterWrite> {
  return {
    id: uuidv4(),
    fullName: 'Phạm Quốc Việt',
    email: 'example@company.com',
    phone: '',
  };
}

function getShippingStores() {
  return [
    { name: '24h', address: '123 Main Street', phone: '123456789' },
    { name: 'ranvang', address: '456 Market Street', phone: '987654321' },
    { name: 'Đức Anh JP', address: '789 Industrial Road', phone: '555123456' },
    { name: 'haiba', address: '321 Ocean Drive', phone: '444555666' },
    { name: 'DC', address: '654 Pine Street', phone: '333666999' },
    { name: 'Quân KR', address: '987 Maple Avenue', phone: '222777888' },
  ];
}

function getSources() {
  return [
    { name: 'Taobao', color: '#ffc8aa' },
    { name: 'StockX', color: '#d3edbd' },
    { name: 'G95', color: '#1aa260' },
    { name: 'Poizon', color: '#4887e8' },
    { name: 'Goat', color: '#c0e0f5' },
    { name: 'Vipshop', color: '#e5cff5' },
  ];
}

function getOrders(userId: string, sources, shippingStores) {
  const orders: any[] = [];
  for (let i = 1; i <= 12; i++) {
    const order = {
      orderNumber: `ORD00${i}`,
      orderDate: new Date(),
      SKU: `SKU${Math.floor(Math.random() * 1000)}`,
      size: Math.floor(Math.random() * 15) + 1, // Random size between 1 and 15
      deposit: Math.floor(Math.random() * 500) + 50, // Random deposit between 50 and 500
      totalPrice: Math.floor(Math.random() * 2000) + 500, // Random totalPrice between 500 and 2500
      deliveryCode: '',
      deliveryCodeStatus: [DeliveryCodeStatus.PENDING, DeliveryCodeStatus.EXIST, DeliveryCodeStatus.DELIVERD][
        Math.floor(Math.random() * 3)
      ],
      shippingFee: Math.floor(Math.random() * 100) + 10, // Random shippingFee between 10 and 100
      checkBox: Math.random() > 0.5, // Random true/false
      userId,
      sourceId: sources[i % 5].id,
      shippingStoreId: shippingStores[i % 5].id,
      status: [OrderStatus.ONGOING, OrderStatus.LANDED, OrderStatus.SHIPPED, OrderStatus.CANCELLED][
        Math.floor(Math.random() * 4)
      ],
    };

    orders.push(order);
  }

  return orders;
}

async function seed() {
  // Delete records
  await db.user.deleteMany();
  await db.shippingStore.deleteMany();
  await db.source.deleteMany();
  await db.order.deleteMany();
  console.log('Deleted all records in related tables');

  // Seed new user
  const user = await getUser();
  console.log(`[*] Seeding Admin : ${JSON.stringify(user)}`);
  console.log(`[*] password : pqvsneakeradmin `);
  const password = 'pqvsneakeradmin';
  const hashedPassword = await hashPassword(password);
  await db.user.create({
    data: {
      ...user,
      account: {
        create: {
          username: 'pqviet',
          password: hashedPassword,
          role: Role.ADMIN,
          id: v4(),
        },
      },
    },
  });

  await Promise.all(
    getShippingStores().map((store) => {
      console.log(`[*] Seeding Shipping Store: ${JSON.stringify(store)}`);
      return db.shippingStore.create({
        data: { ...store, id: uuidv4() },
      });
    })
  );

  await Promise.all(
    getSources().map((source) => {
      console.log(`[*] Seeding Source: ${JSON.stringify(source)}`);
      return db.source.create({
        data: {
          ...source,
          id: uuidv4(),
        },
      });
    })
  );
}

seed();
