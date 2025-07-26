'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getSignInUrl } from '@/lib/auth-utils';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access denied. Please contact your administrator for access.';
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.';
      case 'Verification':
        return 'The verification link may have expired or has already been used.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Typography variant="h2" className="text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </Typography>
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <Typography variant="p">
              {getErrorMessage(error)}
            </Typography>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Link href={getSignInUrl()} className="block w-full">
            <Button className="w-full" size="lg">
              Return to Sign In
            </Button>
          </Link>

          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full" size="lg">
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Typography variant="h2" className="text-3xl font-extrabold text-gray-900">
            Loading...
          </Typography>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 