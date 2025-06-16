export function applyAutoQualification(talent) {
  const invited = talent.join_method === 'invited';
  const hasKeywords = talent.bio?.toLowerCase().includes('seo') || talent.expertise?.toLowerCase().includes('seo');

  const newHistoryEntry = {
    reason: invited ? 'invited' : hasKeywords ? 'resume_match' : 'manual',
    timestamp: new Date().toISOString(),
  };

  return {
    ...talent,
    is_qualified: invited || hasKeywords,
    qualification_reason: newHistoryEntry.reason,
    qualification_history: [...(talent.qualification_history || []), newHistoryEntry],
  };
}

export function validateCSVHeaders(headers) {
  const required = ['full_name', 'email', 'expertise'];
  const missing = required.filter((h) => !headers.includes(h));
  return missing;
}

export function parseCSVData(text) {
  const lines = text.split('\n').filter(Boolean);
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const missing = validateCSVHeaders(headers);
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`);

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const record = {};
    headers.forEach((h, i) => (record[h] = values[i] || ''));
    return record;
  });
}

export async function insertInvitedTalents(records, supabase) {
  let count = 0;
  for (const r of records) {
    const { full_name, email, expertise } = r;
    if (!full_name || !email || !expertise) continue;
    const { error } = await supabase.from('talent_profiles').insert({
      full_name,
      email,
      expertise,
      join_method: 'invited',
      is_qualified: true,
      qualification_reason: 'invited',
      qualification_history: [
        {
          reason: 'invited',
          timestamp: new Date().toISOString(),
        },
      ],
    });
    if (!error) count++;
  }
  return count;
}

export function getUpdatedTalentsWithQualification(talents, shouldQualify) {
  return talents.map((talent) => {
    const reason = 'manual';
    const historyEntry = {
      reason,
      timestamp: new Date().toISOString(),
    };
    return {
      ...talent,
      is_qualified: shouldQualify,
      qualification_reason: reason,
      qualification_history: [...(talent.qualification_history || []), historyEntry],
    };
  });
}
