import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@supabase/supabaseClient'
import ExperienceBadge from '@/components/ExperienceBadge'

export default function TalentPortfolioPage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // First try to fetch by username
        let { data: profileData, error: usernameError } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('username', username)
          .single();

        // If not found by username, try by ID
        if (usernameError) {
          const { data: idData, error: idError } = await supabase
            .from('talent_profiles')
            .select('*')
            .eq('id', username)
            .single();
            
          if (!idError) {
            profileData = idData;
          }
        }

        if (profileData) {
          setProfile(profileData);

          const { data: projects } = await supabase
            .from('projects')
            .select('id, title, description, status')
            .eq('talent_id', profileData.id)
            .eq('added_to_portfolio', true);

          setPortfolio(projects || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3A8C] mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Summary */}
      <div className="flex flex-col md:flex-row items-center bg-white p-6 rounded-lg shadow mb-6 border">
        <div className="flex-shrink-0 mr-6 mb-4 md:mb-0">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt={profile.full_name}
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-bold text-[#2E3A8C]">{profile.full_name}</h1>
          <p className="text-gray-700 text-sm">{profile.expertise}</p>
          {profile?.metadata?.marketing?.experience_badge && (
            <ExperienceBadge badge={profile.metadata.marketing.experience_badge} showTooltip />
          )}
          {profile.username && (
            <p className="text-sm text-gray-500">@{profile.username}</p>
          )}
          {profile.location && <p className="text-sm text-gray-600">📍 {profile.location}</p>}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2E3A8C] underline hover:text-[#1B276F]"
            >
              LinkedIn Profile
            </a>
          )}
        </div>
      </div>

      {/* About Section */}
      {profile.bio && (
        <div className="bg-gray-50 p-4 rounded mb-6 border">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Portfolio List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Portfolio Projects</h2>
        {portfolio.length === 0 ? (
          <p className="text-gray-500">No public work yet</p>
        ) : (
          <ul className="space-y-4">
            {portfolio.map((proj) => (
              <li key={proj.id} className="border rounded p-4">
                <h3 className="text-lg font-semibold mb-1">{proj.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{proj.description}</p>
                <p className="text-xs text-gray-500">Status: {proj.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}