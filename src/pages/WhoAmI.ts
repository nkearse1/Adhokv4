import { useEffect, useState } from "react";
import { supabase } from "@supabase/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function WhoAmI() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dbRole, setDbRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: user, error } = await supabase.auth.getUser();

      if (user?.user) {
        setUserInfo(user.user);

        const { data: dbUser, error: dbErr } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.user.id)
          .single();

        if (dbUser?.role) {
          setDbRole(dbUser.role);
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardContent className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Who Am I</h1>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" /> Loading...
          </div>
        ) : userInfo ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Supabase UID</p>
              <p className="font-mono break-all text-xs">{userInfo.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{userInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role (from users table)</p>
              {dbRole ? (
                <Badge variant="default">{dbRole}</Badge>
              ) : (
                <p className="text-red-500">No role found in DB</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-500">Not signed in</p>
        )}
      </CardContent>
    </Card>
  );
}