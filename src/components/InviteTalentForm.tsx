import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@supabase/supabaseClient';

export default function InviteTalentForm() {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email) return toast.error('Please enter an email');
    setInviting(true);
    try {
      const { error } = await supabase.from('talent_profiles').insert({
        email,
        join_method: 'invited',
        is_qualified: false,
      });
      if (error) throw error;
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err) {
      toast.error('Failed to invite talent');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Invite New Talent</h2>
        <div className="flex gap-2 items-center">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={inviting}
          />
          <Button onClick={handleInvite} disabled={inviting}>
            {inviting ? 'Inviting...' : 'Send Invite'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}