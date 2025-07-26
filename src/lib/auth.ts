import { DefaultSession, NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserRoles } from './data-service';
import { UserRole } from '@/types/auth';
import { getDatabaseConfig, isGoogleSheetsProvider } from '@/config/database';
import { sqliteAuthOptions } from './auth-sqlite';


declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    roles: UserRole[];
    accessToken?: string;
  }
}

// Define role hierarchies and permissions
export const rolePermissions: Record<UserRole, UserRole[]> = {
  admin: ["admin", "doctor", "pharmacist", "cash_manager", "stock_manager"],
  doctor: ["doctor", "pharmacist", "stock_manager"],
  pharmacist: ["pharmacist", "stock_manager"],
  cash_manager: ["cash_manager"],
  case_manager: ["case_manager"],
  stock_manager: ["stock_manager"],
};

const googleSheetsAuthOptions: NextAuthOptions = {  
  providers: [
    GoogleProvider({      
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/spreadsheets.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      console.log('=== Sign In Callback ===');      

      if (!account?.access_token) {
        console.error('❌ No access token received from Google');
        return false;
      }

      if (!profile?.email) {
        console.error('❌ No email found in profile');
        return false;
      }

      try {        
        const roles = await getUserRoles(profile.email);

        if (!roles || roles.length === 0) {
          console.error('❌ No roles found for user:');
          return false;
        }

        console.log('✅ Sign in successful with roles:');
        return true;
      } catch (error) {
        console.error('❌ Error during sign in:', error);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      console.log('=== JWT Callback ===');
      console.log('Token before:', {
        email: token.email,
        hasRoles: !!token.roles,
      });

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      if (profile?.email) {
        try {
          console.log('🔍 Fetching roles for JWT:');
          const roles = await getUserRoles(profile.email);
          console.log('📋 Roles for JWT:');
          token.roles = roles;
        } catch (error) {
          console.error('❌ Error fetching roles for JWT:', error);
          token.roles = [];
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log('=== Session Callback ===');
      console.log('Session before:', {
        email: session.user?.email,
        hasRoles: !!(session as { roles?: UserRole[] }).roles,
      });

      const updatedSession = {
        ...session,
        accessToken: token.accessToken,
        roles: token.roles || [],
      };

      console.log('Session after:', {
        email: !!updatedSession.user?.email,
        hasRoles: !!updatedSession.roles,
      });

      return updatedSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug mode only in development
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account }) {
      console.log('=== Sign In Event ===');
      console.log('User:', {
        email: user.email,
        name: user.name,
      });
      console.log('Account:', {
        provider: account?.provider,
        type: account?.type,
      });
    },
    async signOut({ token }) {
      console.log('=== Sign Out Event ===');
      console.log('Token:', {
        email: token.email,
        hasRoles: !!token.roles,
      });
    },
  },
};

export const authOptions: NextAuthOptions = isGoogleSheetsProvider() 
  ? googleSheetsAuthOptions 
  : sqliteAuthOptions; 