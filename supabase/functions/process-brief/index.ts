import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import * as pdfParse from 'npm:pdf-parse@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function extractTextFromPDF(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = await pdfParse.default(new Uint8Array(buffer));
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document');
  }
}

async function extractKeyInfo(text: string) {
  const info: Record<string, any> = {};
  
  // Extract project title
  const titleMatch = text.match(/(?:project|title|brief)[:]\s*([^\n]+)/i) ||
                    text.match(/^([^\n]{10,100})/);
  if (titleMatch) {
    info.projectTitle = titleMatch[1].trim();
  }

  // Extract budget
  const budgetMatch = text.match(/(?:budget|cost|estimate)[:]\s*\$?\s*(\d+[,\d]*(\.\d{2})?)/i) ||
                      text.match(/\$\s*(\d+[,\d]*(\.\d{2})?)/);
  if (budgetMatch) {
    info.budget = budgetMatch[1].replace(/,/g, '');
  }

  // Extract dates
  const datePatterns = [
    /(?:deadline|completion|due|target)[\s:]*([\d]{1,2}[-/][\d]{1,2}[-/][\d]{2,4})/i,
    /(?:deadline|completion|due|target)[\s:]*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.]+\d{1,2}(?:st|nd|rd|th)?[\s,]*\d{4})/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          info.desiredDate = date.toISOString().split('T')[0];
          break;
        }
      } catch (e) {
        console.warn('Date parsing failed:', e);
      }
    }
  }

  // Extract description
  const descriptionPatterns = [
    /(?:description|overview|summary|scope)[:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i,
    /(?:project details|requirements)[:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];

  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.description = match[1].trim();
      break;
    }
  }

  // Extract expertise level
  const expertisePatterns = {
    entry: /\b(?:junior|entry[\s-]level|beginner)\b/i,
    expert: /\b(?:senior|expert|advanced|specialist)\b/i,
    mid: /\b(?:mid[\s-]level|intermediate|regular)\b/i
  };

  for (const [level, pattern] of Object.entries(expertisePatterns)) {
    if (pattern.test(text)) {
      info.expertiseLevel = level;
      break;
    }
  }

  // Extract marketing channels
  const channels = {
    seo: /\b(?:seo|search engine optimization)\b/i,
    sem: /\b(?:sem|paid search|google ads|ppc)\b/i,
    social: /\b(?:social media|facebook|instagram|linkedin|twitter)\b/i,
    content: /\b(?:content|blog|article|copywriting)\b/i
  };

  info.channels = {};
  for (const [channel, pattern] of Object.entries(channels)) {
    info.channels[channel] = pattern.test(text);
  }

  return info;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Extract text from the document
    const text = await extractTextFromPDF(fileUrl);
    
    // Process the text to extract key information
    const extractedInfo = await extractKeyInfo(text);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedInfo 
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});