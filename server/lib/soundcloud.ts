// SoundCloud search implementation using public API
import fetch from 'node-fetch';

export interface SoundCloudSearchResult {
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

export async function searchSoundCloud(query: string, maxResults: number = 20): Promise<SoundCloudSearchResult[]> {
  try {
    // Using SoundCloud's public search endpoint (doesn't require API key for basic searches)
    const url = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&limit=${maxResults}&client_id=iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      console.log(`SoundCloud API returned status ${response.status}`);
      return [];
    }

    const data: any = await response.json();
    const tracks = data.collection || [];

    const results: SoundCloudSearchResult[] = [];

    for (const item of tracks) {
      // Only process tracks, not playlists or users
      if (item.kind === 'track' && item.id) {
        const durationMs = item.duration || 0;
        const duration = formatDuration(durationMs);
        
        results.push({
          id: String(item.id),
          title: item.title || 'Unknown',
          artist: item.user?.username || 'Unknown Artist',
          thumbnail: item.artwork_url || item.user?.avatar_url || '',
          duration: duration,
          url: item.permalink_url || `https://soundcloud.com/${item.user?.permalink}/${item.permalink}`,
          embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(item.permalink_url || '')}`,
          publishedAt: item.created_at || new Date().toISOString(),
          viewCount: item.playback_count || 0,
          description: item.description || `${item.title} by ${item.user?.username || 'Unknown'}`,
          platform: 'soundcloud'
        });
      }
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('SoundCloud search error:', error);
    return [];
  }
}

// Helper function to format duration from milliseconds
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
