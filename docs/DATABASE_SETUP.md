# Database Setup Guide

This application supports two database providers: **Google Sheets** and **SQLite**. You can switch between them using a configuration setting.

## Configuration

Set the `DATABASE_PROVIDER` environment variable to choose your preferred provider:

```env
# For SQLite (recommended for local development)
DATABASE_PROVIDER=sqlite

# For Google Sheets (recommended for simple cloud deployment)
DATABASE_PROVIDER=googlesheets
```

## SQLite Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_PROVIDER=sqlite
SQLITE_DB_PATH=./atc.db
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin User
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
npm run init-sqlite
```

This will:
- Create the SQLite database with all required tables
- Create an admin user with the credentials from your environment variables
- Insert sample data for testing

### 4. Start the Application

```bash
npm run dev
```

### 5. Sign In

Navigate to `http://localhost:3000/auth/signin-sqlite` and use your admin credentials.

## Google Sheets Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_PROVIDER=googlesheets
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_ROLES_SHEET_NAME=Roles
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. Google Cloud Setup

1. Create a Google Cloud Project
2. Enable the Google Sheets API
3. Create a Service Account and download the JSON key
4. Set up OAuth 2.0 credentials for web application
5. Share your Google Sheet with the service account email

### 3. Initialize Sheets

```bash
npm run dev
```

Use the existing Google Sheets initialization script if available.

### 4. Sign In

Navigate to `http://localhost:3000/auth/signin` and sign in with your Google account.

## Features

### SQLite Provider
- ✅ Local database file
- ✅ Password-based authentication
- ✅ Better performance for large datasets
- ✅ Full CRUD operations
- ✅ Data integrity with foreign keys
- ✅ Indexing for better query performance

### Google Sheets Provider
- ✅ Cloud-based storage
- ✅ Google OAuth authentication
- ✅ Easy to view/edit data in spreadsheet format
- ✅ Real-time collaboration
- ✅ Automatic backups via Google Drive

## Switching Providers

To switch between providers:

1. Update the `DATABASE_PROVIDER` environment variable
2. Restart the application
3. The appropriate authentication flow will be used automatically

## Authentication

- **SQLite**: Uses email/password credentials stored in the database
- **Google Sheets**: Uses Google OAuth with role-based access control

## Data Migration

Currently, there's no automatic migration between providers. If you need to migrate:

1. Export data from the current provider
2. Transform the data format if needed
3. Import into the new provider

## Troubleshooting

### SQLite Issues
- Ensure the database file path is writable
- Check that all required environment variables are set
- Run `npm run init-sqlite` if the database is corrupted

### Google Sheets Issues
- Verify service account permissions
- Check that the sheet is shared with the service account
- Ensure OAuth credentials are correctly configured
- Verify the sheet structure matches expected columns