import { isGoogleSheetsProvider, isSQLiteProvider } from '@/config/database';

export function getSignInUrl(): string {
  if (isGoogleSheetsProvider()) {
    return '/auth/signin';
  } else if (isSQLiteProvider()) {
    return '/auth/signin-sqlite';
  }
  // Default fallback
  return '/auth/signin';
}