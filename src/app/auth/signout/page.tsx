'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({ redirect: false });
      router.push('/');
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full text-center p-8">
        <Typography variant="h2" className="mb-4">
          Signing Out
        </Typography>
        <Typography color="muted" className="mb-6">
          You are being signed out. Please wait...
        </Typography>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/')}
        >
          Return to Home
        </Button>
      </Card>
    </div>
  );
} 