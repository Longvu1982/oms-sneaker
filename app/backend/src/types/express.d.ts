import { TloginRequest } from './general';

declare module 'express' {
  interface Request {
    user?: TloginRequest & { account: Omit<Account, 'createdAt' | 'updatedAt' | 'password'> };
  }
}
