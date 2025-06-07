import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID } from "@/lib/google-sheets";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:Z", // Adjust range as needed
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1", // Adjust range as needed
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [Object.values(body)],
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error appending sheet data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 