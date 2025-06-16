// parseResume.ts

export type ExperienceLevel = 'entry' | 'mid' | 'expert';

export function extractYearsFromText(text: string): number {
  const yearPatterns = [
    /\b(\d+)\+?\s+years?\s+(?:of\s+)?experience\b/i,
    /worked\s+(?:from|since)\s+(\d{4})\s+(?:to|until)?\s*(\d{4}|present)/i,
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match.length === 3) {
        const start = parseInt(match[1], 10);
        const end = match[2].toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(match[2], 10);
        return end - start;
      } else if (match.length === 2) {
        return parseInt(match[1], 10);
      }
    }
  }

  return 0;
}

export function classifyExperienceLevel(years: number): ExperienceLevel {
  if (years >= 7) return 'expert';
  if (years >= 3) return 'mid';
  return 'entry';
}

export function parseResume(text: string): { years: number; level: ExperienceLevel } {
  const years = extractYearsFromText(text);
  const level = classifyExperienceLevel(years);
  return { years, level };
}

// Example company tier mapping (can be moved to constants.js)
const COMPANY_TIERS = {
  Google: 5,
  Microsoft: 5,
  Meta: 4.5,
  Zapier: 4,
  Shopify: 4,
  Freelancer: 2,
  Unknown: 1
}

function getCompanyRating(companyName: string) {
  return COMPANY_TIERS[companyName] || 2.5 // Default to mid-tier if unknown
}

function assignExperienceBadge(totalYears: number, avgRating: number): string {
  if (totalYears >= 8 && avgRating >= 4.5) return 'Elite Expert'
  if (totalYears >= 8 && avgRating >= 3.5) return 'Expert Talent'
  if (totalYears >= 3 && avgRating >= 3.5) return 'Pro Talent'
  return 'Specialist'
}

export function parseResumeAndAssignBadge(parsedJobs: {
  company: string
  from: string
  to: string
}[]) {
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25

  const durations = parsedJobs.map(job => {
    const start = new Date(job.from)
    const end = job.to === 'Present' ? new Date() : new Date(job.to)
    return (end.getTime() - start.getTime()) / msPerYear
  })

  const totalYears = durations.reduce((a, b) => a + b, 0)

  const ratings = parsedJobs.map(job => getCompanyRating(job.company))
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

  const badge = assignExperienceBadge(totalYears, avgRating)

  return {
    total_experience_years: parseFloat(totalYears.toFixed(1)),
    avg_company_rating: parseFloat(avgRating.toFixed(1)),
    experience_badge: badge
  }
}
