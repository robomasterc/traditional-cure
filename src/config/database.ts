export type DatabaseProvider = 'googlesheets' | 'sqlite';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  googleSheets?: {
    spreadsheetId: string;
    serviceAccountEmail: string;
    serviceAccountPrivateKey: string;
    rolesSheetName: string;
  };
  sqlite?: {
    dbPath: string;
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const provider = (process.env.DATABASE_PROVIDER || 'googlesheets') as DatabaseProvider;
  
  const config: DatabaseConfig = {
    provider,
  };

  if (provider === 'googlesheets') {
    config.googleSheets = {
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!,
      rolesSheetName: process.env.GOOGLE_SHEETS_ROLES_SHEET_NAME!,
    };
  } else if (provider === 'sqlite') {
    config.sqlite = {
      dbPath: process.env.SQLITE_DB_PATH || './atc.db',
    };
  }

  return config;
};

export const isGoogleSheetsProvider = (): boolean => {
  return getDatabaseConfig().provider === 'googlesheets';
};

export const isSQLiteProvider = (): boolean => {
  return getDatabaseConfig().provider === 'sqlite';
};