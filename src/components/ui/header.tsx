import { Typography } from './typography';
import { Button } from './button';
import { Container } from './container';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { getSignInUrl } from '@/lib/auth-utils';
import { SignOutButton } from '@/components/auth/sign-out-button';

interface HeaderProps {
  variant?: 'default' | 'transparent';
  showAuth?: boolean;
  showUserInfo?: boolean;
  userName?: string;
  userRoles?: string[];
}

export function Header({
  variant = 'default',
  showAuth = false,
  showUserInfo = false,
  userName,
  userRoles,
}: HeaderProps) {
  return (
    <nav className={cn(
      "border-b border-gray-200",
      variant === 'default' ? "bg-white" : "bg-transparent"
    )}>
      <Container>
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Typography variant="h4" className="text-gray-900">
              Health and Wellness
            </Typography>
          </div>
          
          <div className="flex items-center gap-4">
            {showUserInfo && userName && (
              <div className="text-right">
                <Typography>{userName}</Typography>
                {userRoles && (
                  <Typography variant="small" color="muted">
                    {userRoles.join(", ")}
                  </Typography>
                )}
              </div>
            )}
            
            {showAuth ? (
              <>
                <Link href={getSignInUrl()}>
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href={getSignInUrl()}>
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <SignOutButton />
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
} 