import fetch from 'node-fetch';

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FinancialPlannerPro/1.0 (contact@yourdomain.com)'
    }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }
  return null;
} 