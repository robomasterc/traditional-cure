import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { getGoogleSheetsClient, getAllUserRoles } from '@/lib/google-sheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.roles?.includes('admin')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await getAllUserRoles();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.roles?.includes('admin')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email, roles } = await request.json();
    if (!email || !roles || !Array.isArray(roles)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'UserRoles!A:B';

    // Get existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const existingRowIndex = rows.findIndex(row => row[0] === email);

    if (existingRowIndex >= 0) {
      // Update existing user
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `UserRoles!B${existingRowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[roles.join(', ')]],
        },
      });
    } else {
      // Add new user
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[email, roles.join(', ')]],
        },
      });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error updating roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.roles?.includes('admin')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email, roles } = await request.json();
    if (!email || !roles || !Array.isArray(roles)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'UserRoles!A:B';

    // Get existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const existingRowIndex = rows.findIndex(row => row[0] === email);

    if (existingRowIndex >= 0) {
      // Update existing user
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `UserRoles!B${existingRowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[roles.join(', ')]],
        },
      });
    } else {
      return new NextResponse('User not found', { status: 404 });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error updating roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.roles?.includes('admin')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = 'UserRoles!A:B';

    // Get existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const existingRowIndex = rows.findIndex(row => row[0] === email);

    if (existingRowIndex >= 0) {
      // Delete the row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // You might need to get the actual sheet ID
                  dimension: 'ROWS',
                  startIndex: existingRowIndex,
                  endIndex: existingRowIndex + 1,
                },
              },
            },
          ],
        },
      });
    } else {
      return new NextResponse('User not found', { status: 404 });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 