import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TalentSignUpForm } from '@/components/TalentSignUpForm';

export default function TalentSignUpPage() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="h-8 w-8 text-[#2E3A8C] font-bold text-2xl">💼</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2F2F2F]">Adhok</h1>
          </div>
          <p className="text-sm text-[#00A499] font-medium">
            Sign up to earn from second-stream projects
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up as Talent</CardTitle>
            <CardDescription>
              Join our platform and start working on exciting projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TalentSignUpForm loading={loading} setLoading={setLoading} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}