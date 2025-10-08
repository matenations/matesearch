import fetch from 'node-fetch';

export interface MixcloudResult {
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

export async function searchMixcloud(query: string, maxResults: number = 20): Promise<MixcloudResult[]> {
  try {
    // Mixcloud API endpoint
    const url = `https://api.mixcloud.com/search/?q=${encodeURIComponent(query)}&type=cloudcast&limit=${maxResults}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mixcloud API error: ${response.status}`);
    }

    const data: any = await response.json();
    const cloudcasts = data?.data || [];

    const results: MixcloudResult[] = cloudcasts.map((cast: any) => {
      const durationSeconds = cast.audio_length || 0;
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      return {
        id: cast.key || cast.slug,
        title: cast.name || 'Unknown',
        artist: cast.user?.name || cast.user?.username || 'Unknown Artist',
        thumbnail: cast.pictures?.large || cast.pictures?.medium || cast.pictures?.thumbnail || '',
        duration: duration,
        url: cast.url || `https://www.mixcloud.com${cast.key}`,
        embedUrl: `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(cast.key || '')}`,
        publishedAt: cast.created_time || new Date().toISOString(),
        viewCount: cast.play_count || 0,
        description: cast.description || `${cast.name} by ${cast.user?.name || 'Unknown'}`,
        platform: 'mixcloud'
      };
    });

    return results;
  } catch (error) {
    console.error('Mixcloud search error:', error);
    return [];
  }
}
