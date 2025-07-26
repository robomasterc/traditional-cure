import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDataService } from './data-service';
import { UserRole } from '@/types/auth';
import { isSQLiteProvider } from '@/config/database';

export const sqliteAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const dataService = getDataService();
          
          if ('authenticateUser' in dataService) {
            const user = await dataService.authenticateUser(credentials.email, credentials.password);
            
            if (user) {
              return {
                id: user.id,
                email: credentials.email,
                name: user.name,
                roles: user.roles
              };
            }
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        roles: token.roles || [],
        user: {
          ...session.user,
          id: token.id as string,
        }
      };
    },
  },
  pages: {
    signIn: '/auth/signin-sqlite',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Helper function to create initial admin user
export async function createInitialAdminUser(email: string, password: string, name: string): Promise<void> {
  if (!isSQLiteProvider()) {
    throw new Error('Initial admin user creation is only supported for SQLite provider');
  }

  const dataService = getDataService();
  
  if ('createUser' in dataService) {
    await dataService.createUser(email, password, name, ['admin']);
    console.log('✅ Initial admin user created successfully');
  } else {
    throw new Error('Data service does not support user creation');
  }
}