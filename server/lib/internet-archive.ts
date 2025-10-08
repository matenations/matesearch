import fetch from 'node-fetch';

export interface InternetArchiveResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  url: string;
  embedUrl: string;
  publishedAt: string;
  viewCount: number;
  description: string;
  platform: string;
}

export async function searchInternetArchive(query: string, maxResults: number = 20): Promise<InternetArchiveResult[]> {
  try {
    const url = 'https://archive.org/advancedsearch.php';
    const params = new URLSearchParams({
      'q': `collection:audio AND (${query})`,
      'fl[]': 'identifier,title,creator,date,format,description',
      'rows': String(maxResults * 2),
      'page': '1',
      'output': 'json'
    });

    const response = await fetch(`${url}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Internet Archive API error: ${response.status}`);
    }

    const data: any = await response.json();
    const docs = data?.response?.docs || [];

    const results: InternetArchiveResult[] = [];

    for (const doc of docs) {
      const identifier = doc.identifier;
      const title = doc.title || 'Unknown';
      const creator = Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator || 'Unknown Artist');
      const year = doc.date || 'Unknown';
      const description = doc.description || `${title} by ${creator}`;

      results.push({
        id: identifier,
        title: title,
        artist: creator,
        thumbnail: `https://archive.org/services/img/${identifier}`,
        duration: '0:00', // Internet Archive doesn't provide duration in search results
        url: `https://archive.org/details/${identifier}`,
        embedUrl: `https://archive.org/embed/${identifier}`,
        publishedAt: year,
        viewCount: 0,
        description: description,
        platform: 'internet-archive'
      });
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Internet Archive search error:', error);
    return [];
  }
}
