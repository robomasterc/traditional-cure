'use client';

import { signIn } from 'next-auth/react';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams() || {};
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';  
  const error = searchParams.get('error');

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      });      

      if (result?.error) {
        console.log(result);
        console.error('Sign in error:', result.error);
        router.push(`/auth/error?error=${result.error}`);
      } else if (result?.url) {
        console.log( "result.url", result.url);
        router.push(result.url);
      }
    } catch (error) {
      console.log(error);
      console.error('Sign in error:', error);
      router.push('/auth/error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Typography variant="h2" className="text-center text-3xl font-extrabold text-gray-900">
            Welcome to Health and Wellness
          </Typography>
          <Typography variant="p" className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your healthcare management dashboard
          </Typography>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <Typography variant="small">
              {error === 'AccessDenied' 
                ? 'Access denied. Please contact your administrator for access.'
                : 'An error occurred during sign in. Please try again.'}
            </Typography>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <Button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FcGoogle className="h-5 w-5" />
            )}
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </Button>

          <div className="text-center">
            <Typography variant="small" color="muted">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
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
      <SignInContent />
    </Suspense>
  );
} 