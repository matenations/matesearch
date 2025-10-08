import { Router } from "express";
import { searchYouTube } from "../lib/youtube";

const router = Router();

async function fetchLyrics(artist: string, track: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.lyrics || null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const queryParts = query.split(/[-–—]/);
    let artist = "";
    let track = "";
    
    if (queryParts.length >= 2) {
      artist = queryParts[0].trim();
      track = queryParts[1].trim();
    } else {
      track = query.trim();
    }

    const youtubeResults = await searchYouTube(query);
    let videoId: string | null = null;
    
    if (youtubeResults.length > 0) {
      const urlMatch = youtubeResults[0].url.match(/[?&]v=([^&]+)/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }
    }

    let lyrics: string | null = null;
    
    if (artist && track) {
      lyrics = await fetchLyrics(artist, track);
    }
    
    if (!lyrics && track) {
      const words = track.split(' ');
      if (words.length >= 2) {
        const possibleArtist = words.slice(0, Math.floor(words.length / 2)).join(' ');
        const possibleTrack = words.slice(Math.floor(words.length / 2)).join(' ');
        lyrics = await fetchLyrics(possibleArtist, possibleTrack);
      }
    }

    res.json({
      videoId,
      lyrics: lyrics || "Lyrics not available. Try searching with format: Artist - Song Name",
    });
  } catch (error) {
    console.error("Error in song-info route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
