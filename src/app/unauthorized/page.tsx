import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <Typography variant="h2" className="mb-4">
          Access Denied
        </Typography>
        <Typography color="muted" className="mb-6">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </Typography>
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/api/auth/signout">
            <Button variant="outline" className="w-full">
              Sign Out
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 