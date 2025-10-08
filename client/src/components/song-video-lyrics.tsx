import { useState, useEffect } from "react";
import { Music2, ExternalLink } from "lucide-react";

interface SongVideoLyricsProps {
  searchQuery: string;
}

export function SongVideoLyrics({ searchQuery }: SongVideoLyricsProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoAndLyrics = async () => {
      if (!searchQuery.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/song-info?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          setVideoId(null);
          setLyrics("");
          setError("Unable to load song information");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.videoId) {
          setVideoId(data.videoId);
        }
        
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          setLyrics("Lyrics not available for this song.");
        }
      } catch (err) {
        console.error("Error fetching song info:", err);
        setError("Failed to load song information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAndLyrics();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl glass-elevated border-2 border-violet-400/40 bg-gradient-to-br from-violet-50/50 to-blue-50/40 dark:from-violet-950/30 dark:to-blue-950/20 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-violet-400/20">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">Song Video & Lyrics</h3>
          </div>
        </div>
        <div className="px-6 py-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <span className="text-violet-600 dark:text-violet-300">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-2xl glass-elevated border-2 border-violet-400/40 bg-gradient-to-br from-violet-50/50 to-blue-50/40 dark:from-violet-950/30 dark:to-blue-950/20 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-violet-400/20">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">Song Video & Lyrics</h3>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-violet-600 dark:text-violet-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoId && !lyrics) {
    return null;
  }

  return (
    <div className="mb-8 rounded-2xl glass-elevated border-2 border-violet-400/40 bg-gradient-to-br from-violet-50/50 to-blue-50/40 dark:from-violet-950/30 dark:to-blue-950/20 shadow-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-violet-400/20">
        <div className="flex items-center gap-2">
          <Music2 className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">Song Video & Lyrics</h3>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {videoId ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Song Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : lyrics && (
          <div className="p-4 bg-violet-100/50 dark:bg-violet-900/20 rounded-lg">
            <p className="text-sm text-violet-600 dark:text-violet-400">
              Video not available, but here are the lyrics
            </p>
          </div>
        )}
        
        {lyrics && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300">Lyrics</h4>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery + " lyrics")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                View on Google <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-sm leading-relaxed text-violet-900 dark:text-violet-100 whitespace-pre-wrap max-h-96 overflow-y-auto p-4 bg-white/30 dark:bg-black/20 rounded-lg">
              {lyrics}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
