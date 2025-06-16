import React from "react";
import { useLocation, Link } from "react-router-dom";
import { SignInForm } from "@/components/SignInForm";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const location = useLocation();
  const role = location.state?.role || "client";
  const user_role = role; // Fixes ReferenceError

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="h-8 w-8 text-[#2E3A8C] font-bold text-2xl">💼</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2F2F2F]">Adhok</h1>
          </div>
          <p className="text-sm text-[#00A499] font-medium">Sign in to find second-stream projects</p>
        </div>

        <SignInForm user_role={user_role} />

        <div className="space-y-3">
          <Button 
            variant="link" 
            className="w-full text-gray-600 hover:text-brand-primary"
            asChild
          >
            <Link to="/forgot-password">Forgot your password?</Link>
          </Button>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/talent/signup" 
              className="font-medium text-brand-primary hover:text-brand-primary/90"
            >
              Sign up for Adhok
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}