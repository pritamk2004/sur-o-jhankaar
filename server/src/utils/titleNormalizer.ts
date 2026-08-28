export function cleanTitle(raw: string): string {
  if (!raw) return '';

  let cleaned = raw
    // Remove hashtags like #Video, #Pawan, #Khesari
    .replace(/#[\w\u0900-\u097F\u0980-\u09FF]+/g, '')
    // Remove typical YouTube video noise
    .replace(/\s*\|\s*(?:Official\s*(?:Video|Audio|Music\s*Video)|4K|HD|Full\s*(?:Song|Video)|Lyrical(?:\s*Video)?|Audio\s*Song|Video\s*Song|New\s*Song|Bhojpuri\s*Song|Bengali\s*Song|Hindi\s*Song|Special\s*Song|\d{4})\s*/gi, ' ')
    .replace(/\[(?:Official\s*Video|4K|HD|Full\s*Song|Lyrical|Remastered|Audio)\]/gi, '')
    .replace(/\((?:Official\s*Video|4K|HD|Full\s*Song|Lyrical|Audio|From\s*"[^"]+")\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Strip leading/trailing dashes and quotes
  cleaned = cleaned.replace(/^[-–—:|"']+|[-–—:|"']+$/g, '').trim();

  return cleaned || raw;
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0900-\u097F\u0980-\u09FF]/g, '')
    .trim();
}
