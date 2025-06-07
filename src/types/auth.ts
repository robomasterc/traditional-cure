import { DefaultSession } from 'next-auth';

export type UserRole = 'admin' | 'doctor' | 'pharmacist' | 'cash_manager' | 'stock_manager';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    roles: UserRole[];
  }

  interface JWT {
    accessToken?: string;
    roles: UserRole[];
  }
} 