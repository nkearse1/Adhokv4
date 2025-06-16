// parseResumeFromPDF.ts
import { getDocument } from 'pdfjs-dist';
import { parseResume } from './parseResume';

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + ' ';
  }

  return fullText;
}

export async function parseResumeFromPDF(file: File): Promise<{ years: number; level: string }> {
  const text = await extractTextFromPDF(file);
  return parseResume(text);
}