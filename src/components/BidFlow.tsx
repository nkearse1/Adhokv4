import { useEffect, useState } from 'react'
import { supabase } from '@supabase/supabaseClient'
import ExperienceBadge from '@/components/ExperienceBadge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const badgeRank = {
  'Expert Talent': 3,
  'Pro Talent': 2,
  'Specialist': 1,
  '': 0
}

export default function BidFlow({ projectId, isAdmin = false }) {
  const [bids, setBids] = useState([])
  const [project, setProject] = useState(null)
  const [showAllBids, setShowAllBids] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true)
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            minimum_badge,
            project_bids!project_bids_project_id_fkey (
              id,
              rate_per_hour,
              professional_id,
              professional_profile:professional_id ( full_name, experience_badge )
            )
          `)
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError

        setProject(projectData)
        setBids(
          (projectData.project_bids || []).map(bid => ({
            id: bid.id,
            ratePerHour: bid.rate_per_hour,
            name: bid.professional_profile?.full_name || 'Unknown',
            badge: bid.professional_profile?.experience_badge || '',
            professional_id: bid.professional_id // used for admin override
          }))
        )
      } catch (error) {
        console.error('Error fetching bids:', error)
        toast.error('Failed to load bids')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchBids()
    }
  }, [projectId])

  const handlePickWinner = async (professionalId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          winning_bid_id: professionalId,
          talent_id: professionalId,
          status: 'in_progress'
        })
        .eq('id', project.id)

      if (error) throw error
      toast.success('Winner selected')
    } catch (error) {
      console.error('Error selecting winner:', error)
      toast.error('Error selecting winner')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3A8C]"></div>
      </div>
    )
  }

  if (!project) {
    return <p className="text-red-500">Project not found</p>
  }

  const filteredBids = showAllBids
    ? bids
    : bids.filter(bid => badgeRank[bid.badge] >= badgeRank[project.minimum_badge || 'Specialist'])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Submitted Bids</h2>
        <Button onClick={() => setShowAllBids(prev => !prev)} variant="outline">
          {showAllBids ? 'Hide Underqualified Bids' : 'Show All Bids'}
        </Button>
      </div>

      {filteredBids.length === 0 ? (
        <p className="text-gray-500">No bids meet the current qualification level</p>
      ) : (
        filteredBids.map((bid) => (
          <div key={bid.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{bid.name}</p>
              <ExperienceBadge badge={bid.badge} size="sm" showTooltip />
              {badgeRank[bid.badge] < badgeRank[project.minimum_badge || 'Specialist'] && (
                <p className="text-xs text-yellow-500 mt-1">Below project requirements</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">${bid.ratePerHour}/hr</p>
              {isAdmin && (
                <Button size="sm" onClick={() => handlePickWinner(bid.professional_id)}>
                  Mark as Winner
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}