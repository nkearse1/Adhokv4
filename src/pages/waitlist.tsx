import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { supabase } from "@supabase/supabaseClient";

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, signed_up_at: new Date().toISOString() }]);

      if (error) throw error;

      setSignedUp(true);
      toast.success('You\'re on the waitlist!');
      setEmail('');
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint error
        toast.error('This email is already on the waitlist');
      } else {
        console.error('Error:', error);
        toast.error('Failed to join waitlist');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/adhok-logo.png" 
              alt="Adhok" 
              className="h-16 w-auto"
            />
          </div>
          <Badge variant="secondary" className="mb-4 text-brand-accent">
            Coming Soon
          </Badge>
          <h2 className="text-4xl font-bold text-brand-neutral mb-4">
            The Future of Marketing Project Auctions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join the waitlist for early access to our revolutionary platform connecting marketing professionals with high-value projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <Card className="bg-white/50 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-neutral">Join Our Community</h3>
                  <p className="text-gray-600">Be the first to access Adhok</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    disabled={submitting || signedUp}
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                  disabled={submitting || signedUp}
                >
                  {signedUp ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      You're on the list!
                    </span>
                  ) : submitting ? (
                    'Joining...'
                  ) : (
                    <span className="flex items-center gap-2">
                      Join Waitlist
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-brand-neutral">For Marketing Professionals</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Access high-value marketing projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Competitive bidding system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Verified client opportunities
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-brand-neutral">For Clients</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Find qualified marketing talent
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Transparent pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                  Managed project delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}