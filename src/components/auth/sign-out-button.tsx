'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className,
  children = 'Sign Out'
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleSignOut}
    >
      {children}
    </Button>
  );
}