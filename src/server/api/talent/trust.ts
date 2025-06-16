import { Request, Response } from 'express';
import { supabase } from '@supabase/supabaseClient';
import { isAdmin } from '../../middleware/auth';

interface TrustScoreFactors {
  completedProjects: number;
  adminComplaints: number;
  missedDeadlines: number;
  positiveRatings: number;
  responseTime: number;
  clientRetention: number;
}

/**
 * Calculate trust score based on various factors
 * @param factors Trust score factors
 * @returns Trust score between 0-100
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
 * @param talentId Talent ID
 * @returns Trust score factors
 */
async function getTrustScoreFactors(talentId: string): Promise<TrustScoreFactors> {
  try {
    // Get completed projects count
    const { count: completedProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('talent_id', talentId)
      .eq('status', 'completed');
    
    // Get admin complaints count
    const { count: adminComplaints } = await supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', talentId)
      .eq('action', 'flag_talent');
    
    // Get missed deadlines count
    const { count: missedDeadlines } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('talent_id', talentId)
      .lt('deadline', 'now()')
      .neq('status', 'completed');
    
    // Get positive ratings count (4-5 stars)
    const { count: positiveRatings } = await supabase
      .from('project_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('project.talent_id', talentId)
      .gte('rating', 4);
    
    // Get average response time (in hours)
    const { data: responseTimeData } = await supabase
      .rpc('get_talent_avg_response_time', { talent_id: talentId });
    
    const responseTime = responseTimeData || 12; // Default to 12 hours if no data
    
    // Get client retention (repeat clients)
    const { data: clientRetentionData } = await supabase
      .rpc('get_talent_repeat_clients', { talent_id: talentId });
    
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
    console.error('Error getting trust score factors:', error);
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

/**
 * Update trust score for a talent
 * @param req Request
 * @param res Response
 */
export async function updateTrustScore(req: Request, res: Response) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { talentId } = req.params;
    
    if (!talentId) {
      return res.status(400).json({ error: 'Talent ID is required' });
    }
    
    // Call the RPC function to update trust score
    const { data, error } = await supabase
      .rpc('update_talent_trust_score', { talent_id: talentId });
    
    if (error) {
      throw error;
    }
    
    // Log the trust score update
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: req.user?.id,
        action: 'update_trust_score',
        entity_type: 'talent_profiles',
        entity_id: talentId,
        details: data
      });
    
    return res.status(200).json({ 
      success: true, 
      trustScore: data.trust_score,
      factors: data.factors
    });
  } catch (error) {
    console.error('Error updating trust score:', error);
    return res.status(500).json({ error: 'Failed to update trust score' });
  }
}

/**
 * Get trust score for a talent
 * @param req Request
 * @param res Response
 */
export async function getTrustScore(req: Request, res: Response) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    const { talentId } = req.params;
    
    if (!talentId) {
      return res.status(400).json({ error: 'Talent ID is required' });
    }
    
    // Get talent profile with trust score
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('trust_score, trust_score_updated_at, trust_score_factors')
      .eq('id', talentId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data || data.trust_score === null) {
      // If trust score doesn't exist, calculate it
      const factors = await getTrustScoreFactors(talentId);
      const trustScore = calculateTrustScore(factors);
      
      return res.status(200).json({ 
        trustScore,
        factors,
        lastUpdated: null,
        note: 'Trust score calculated on demand (not yet saved)'
      });
    }
    
    return res.status(200).json({ 
      trustScore: data.trust_score,
      factors: data.trust_score_factors,
      lastUpdated: data.trust_score_updated_at
    });
  } catch (error) {
    console.error('Error getting trust score:', error);
    return res.status(500).json({ error: 'Failed to get trust score' });
  }
}

/**
 * Recalculate trust scores for all talents
 * @param req Request
 * @param res Response
 */
export async function recalculateAllTrustScores(req: Request, res: Response) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    // Call the RPC function to recalculate all trust scores
    const { data, error } = await supabase
      .rpc('recalculate_all_trust_scores');
    
    if (error) {
      throw error;
    }
    
    // Log the bulk update
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: req.user?.id,
        action: 'recalculate_all_trust_scores',
        entity_type: 'talent_profiles',
        entity_id: null,
        details: {
          count: data,
          timestamp: new Date().toISOString()
        }
      });
    
    return res.status(200).json({ 
      success: true, 
      processed: data
    });
  } catch (error) {
    console.error('Error recalculating trust scores:', error);
    return res.status(500).json({ error: 'Failed to recalculate trust scores' });
  }
}