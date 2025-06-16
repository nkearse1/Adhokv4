import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@supabase/supabaseClient";
import { Loader2 } from "lucide-react";

export function TalentSignUpForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const fullName = formData.get('full_name') as string;
      const email = formData.get('email') as string;
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const phone = formData.get('phone') as string;
      const location = formData.get('location') as string;
      const linkedin = formData.get('linkedin') as string;
      const portfolio = formData.get('portfolio') as string;
      const bio = formData.get('bio') as string;
      const expertise = formData.get('expertise') as string;
      const resumeFile = formData.get('resume') as File;

      if (!fullName || !email || !username || !password || !bio || !expertise || !resumeFile) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        toast.error('Username must be 3-30 characters and contain only letters, numbers, and underscores');
        return;
      }

      // Check if username is available
      const { data: existingUser } = await supabase
        .rpc('get_user_by_username_or_email', { identifier: username });

      if (existingUser && existingUser.length > 0) {
        toast.error('Username is already taken');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: fullName,
            user_role: 'talent',
            username: username
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      const userId = authData.user.id;

      const fileName = `${Date.now()}-${resumeFile.name}`;
      const filePath = `resumes/${authData.user.id}/${fileName}`;

      const { error: storageError } = await supabase
        .storage
        .from('resumes')
        .upload(filePath, resumeFile);

      if (storageError) {
        toast.error('Failed to upload resume');
        return;
      }

      const { error: profileError } = await supabase
        .from('talent_profiles')
        .insert([{
          id: authData.user.id,
          full_name: fullName,
          email,
          username,
          phone,
          location,
          linkedin,
          portfolio,
          bio,
          expertise,
          resume_url: filePath
        }]);

      if (profileError) {
        toast.error('Failed to create profile');
        return;
      }

      // Also create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          full_name: fullName,
          email,
          username,
          user_role: 'talent'
        }]);

      if (userError) {
        console.warn('Failed to create user record:', userError);
        // Don't fail the signup process for this
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/talent/signin');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Talent Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="full_name">Full Name *</Label><Input id="full_name" name="full_name" required disabled={isSubmitting} /></div>
          <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" required disabled={isSubmitting} /></div>
          <div><Label htmlFor="username">Username *</Label><Input id="username" name="username" required disabled={isSubmitting} placeholder="3-30 characters, letters, numbers, underscores" /></div>
          <div><Label htmlFor="password">Password *</Label><Input id="password" name="password" type="password" required minLength={6} disabled={isSubmitting} /></div>
          <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" type="tel" disabled={isSubmitting} /></div>
          <div><Label htmlFor="location">Location</Label><Input id="location" name="location" disabled={isSubmitting} /></div>
          <div><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" name="linkedin" type="url" disabled={isSubmitting} /></div>
          <div><Label htmlFor="portfolio">Portfolio</Label><Input id="portfolio" name="portfolio" type="url" disabled={isSubmitting} /></div>
          <div><Label htmlFor="expertise">Area of Expertise *</Label><Input id="expertise" name="expertise" required disabled={isSubmitting} /></div>
          <div><Label htmlFor="bio">Professional Bio *</Label><Textarea id="bio" name="bio" required disabled={isSubmitting} /></div>
          <div><Label htmlFor="resume">Resume *</Label><Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" required disabled={isSubmitting} /></div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : ("Create Account")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}