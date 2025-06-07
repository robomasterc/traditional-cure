'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ClientSafeProvider } from "next-auth/react";

interface LoginFormProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function LoginForm({ providers }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (providerId: string) => {
    try {
      setIsLoading(true);
      await signIn(providerId, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name} className="flex justify-center">
            <Button
              onClick={() => handleSignIn(provider.id)}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Signing in..." : `Sign in with ${provider.name}`}
            </Button>
          </div>
        ))}
    </div>
  );
} 