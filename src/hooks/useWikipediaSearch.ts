// ============================================================
// src/hooks/useWikipediaSearch.ts
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";

export interface WikiResult {
  /** Page id — used as the unique key and for bookmark ids */
  id: number;
  title: string;
  snippet: string;
  url: string;
}

interface WikiApiResponse {
  query?: {
    search?: Array<{
      pageid: number;
      title: string;
      snippet: string;
    }>;
  };
}

interface UseWikipediaSearchResult {
  results: WikiResult[];
  loading: boolean;
  error: string | null;
  /** Imperatively trigger a search */
  search: (query: string) => void;
}

/** Strip HTML tags from Wikipedia's snippet field. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

const BASE_URL = "https://en.wikipedia.org/w/api.php";

export function useWikipediaSearch(): UseWikipediaSearchResult {
  const [results, setResults] = useState<WikiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the latest request so out-of-order responses don't stomp on newer ones.
  const requestIdRef = useRef(0);

  const search = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const myRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: trimmed,
      srlimit: "10",
      format: "json",
      origin: "*", // enables CORS
    });

    fetch(`${BASE_URL}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<WikiApiResponse>;
      })
      .then((data) => {
        // Ignore responses from superseded requests.
        if (myRequestId !== requestIdRef.current) return;

        const hits = data.query?.search ?? [];
        setResults(
          hits.map((h) => ({
            id: h.pageid,
            title: h.title,
            snippet: stripHtml(h.snippet),
            url: `https://en.wikipedia.org/?curid=${h.pageid}`,
          }))
        );
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (myRequestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setLoading(false);
      });
  }, []);

  // Cleanup: mark any in-flight request as stale on unmount.
  useEffect(() => {
    return () => {
      requestIdRef.current++;
    };
  }, []);

  return { results, loading, error, search };
}
