import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { UserRole } from '@/types/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);
    const roles = await sheetsService.getUserRoles(session.user.email);
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email, roles } = await request.json();
    if (!email || !roles || !Array.isArray(roles)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Validate roles
    const validRoles = roles.filter((role): role is UserRole => 
      ['admin', 'doctor', 'pharmacist', 'cash_manager', 'stock_manager'].includes(role)
    );

    if (validRoles.length === 0) {
      return new NextResponse('Invalid roles', { status: 400 });
    }

    const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);
    const range = 'UserRoles!A:B';

    // Get existing data
    const rows = await sheetsService.getRange(range);
    const existingRowIndex = rows.findIndex((row: string[]) => row[0] === email);

    if (existingRowIndex >= 0) {
      // Update existing user
      await sheetsService.updateRow(
        `UserRoles!B${existingRowIndex + 1}`,
        [validRoles.join(', ')]
      );
    } else {
      // Add new user
      await sheetsService.appendRow(
        range,
        [email, validRoles.join(', ')]
      );
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
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email, roles } = await request.json();
    if (!email || !roles || !Array.isArray(roles)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Validate roles
    const validRoles = roles.filter((role): role is UserRole => 
      ['admin', 'doctor', 'pharmacist', 'cash_manager', 'stock_manager'].includes(role)
    );

    if (validRoles.length === 0) {
      return new NextResponse('Invalid roles', { status: 400 });
    }

    const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);
    const range = 'UserRoles!A:B';

    // Get existing data
    const rows = await sheetsService.getRange(range);
    const existingRowIndex = rows.findIndex((row: string[]) => row[0] === email);

    if (existingRowIndex >= 0) {
      // Update existing user
      await sheetsService.updateRow(
        `UserRoles!B${existingRowIndex + 1}`,
        [validRoles.join(', ')]
      );
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
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);
    const range = 'UserRoles!A:B';

    // Get existing data
    const rows = await sheetsService.getRange(range);
    const existingRowIndex = rows.findIndex((row: string[]) => row[0] === email);

    if (existingRowIndex >= 0) {
      // Delete the row
      await sheetsService.batchUpdate([{
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: existingRowIndex,
            endIndex: existingRowIndex + 1,
          },
        },
      }]);
    } else {
      return new NextResponse('User not found', { status: 404 });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 