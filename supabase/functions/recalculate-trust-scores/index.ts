import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

interface TrustScoreFactors {
  completedProjects: number;
  adminComplaints: number;
  missedDeadlines: number;
  positiveRatings: number;
  responseTime: number;
  clientRetention: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify request is from an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.user_role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Admin access required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all talent profiles
    const { data: talents, error: talentsError } = await supabase
      .from("talent_profiles")
      .select("id");

    if (talentsError) {
      throw talentsError;
    }

    const results = [];

    // Process each talent
    for (const talent of talents) {
      // Get trust score factors
      const factors = await getTrustScoreFactors(supabase, talent.id);
      
      // Calculate trust score
      const trustScore = calculateTrustScore(factors);
      
      // Update talent profile
      const { error: updateError } = await supabase
        .from("talent_profiles")
        .update({
          trust_score: trustScore,
          trust_score_updated_at: new Date().toISOString(),
          trust_score_factors: factors,
        })
        .eq("id", talent.id);
      
      results.push({
        talentId: talent.id,
        trustScore,
        success: !updateError,
      });
    }

    // Log the operation
    await supabase
      .from("admin_audit_logs")
      .insert({
        admin_id: user.id,
        action: "recalculate_all_trust_scores",
        entity_type: "talent_profiles",
        entity_id: null,
        details: {
          count: results.length,
          timestamp: new Date().toISOString(),
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Calculate trust score based on various factors
 */
function calculateTrustScore(factors: TrustScoreFactors): number {
  // Base score starts at 50
  let score = 50;
  
  // Positive factors
  score += factors.completedProjects * 5; // Each completed project adds 5 points
  score += factors.positiveRatings * 3; // Each positive rating (4-5 stars) adds 3 points
  score += factors.clientRetention * 10; // Each repeat client adds 10 points
  
  // Negative factors
  score -= factors.adminComplaints * 15; // Each admin complaint reduces 15 points
  score -= factors.missedDeadlines * 8; // Each missed deadline reduces 8 points
  
  // Response time factor (lower is better)
  if (factors.responseTime < 2) score += 10; // < 2 hours
  else if (factors.responseTime < 6) score += 5; // < 6 hours
  else if (factors.responseTime > 24) score -= 10; // > 24 hours
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get trust score factors for a talent
 */
async function getTrustScoreFactors(supabase, talentId: string): Promise<TrustScoreFactors> {
  try {
    // Get completed projects count
    const { count: completedProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("talent_id", talentId)
      .eq("status", "completed");
    
    // Get admin complaints count
    const { count: adminComplaints } = await supabase
      .from("admin_audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("entity_id", talentId)
      .eq("action", "flag_talent");
    
    // Get missed deadlines count
    const { count: missedDeadlines } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("talent_id", talentId)
      .lt("deadline", "now()")
      .neq("status", "completed");
    
    // Get positive ratings count (4-5 stars)
    const { count: positiveRatings } = await supabase
      .from("project_reviews")
      .select("*", { count: "exact", head: true })
      .eq("project.talent_id", talentId)
      .gte("rating", 4);
    
    // Get average response time (in hours)
    const { data: responseTimeData } = await supabase
      .rpc("get_talent_avg_response_time", { talent_id: talentId });
    
    const responseTime = responseTimeData || 12; // Default to 12 hours if no data
    
    // Get client retention (repeat clients)
    const { data: clientRetentionData } = await supabase
      .rpc("get_talent_repeat_clients", { talent_id: talentId });
    
    const clientRetention = clientRetentionData || 0;
    
    return {
      completedProjects: completedProjects || 0,
      adminComplaints: adminComplaints || 0,
      missedDeadlines: missedDeadlines || 0,
      positiveRatings: positiveRatings || 0,
      responseTime,
      clientRetention
    };
  } catch (error) {
    console.error("Error getting trust score factors:", error);
    // Return default values if error
    return {
      completedProjects: 0,
      adminComplaints: 0,
      missedDeadlines: 0,
      positiveRatings: 0,
      responseTime: 12,
      clientRetention: 0
    };
  }
}