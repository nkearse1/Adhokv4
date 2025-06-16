import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/backfill_missing_project_ids`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    return new Response(`Failed to run cleanup: ${error}`, { status: 500 })
  }

  return new Response('Cleanup complete!', { status: 200 })
})
