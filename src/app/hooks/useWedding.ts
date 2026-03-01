import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getWeddingData, getWeddingBySlug } from "@/lib/api/multi-tenant";
import type { WeddingData, Wedding } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface UseWeddingResult {
  weddingData: WeddingData | null;
  wedding: Wedding | null;
  loading: boolean;
  error: string | null;
  weddingSlug: string | undefined;
}

/**
 * Hook to fetch wedding data by slug from URL params
 */
export function useWedding(): UseWeddingResult {
  const { slug } = useParams<{ slug: string }>();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    loadWeddingData(slug);
  }, [slug]);

  const loadWeddingData = async (slugToLoad: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeddingData(slugToLoad);
      
      if (data) {
        setWeddingData(data);
      } else {
        setError("Wedding not found");
        toast.error("Wedding tidak ditemukan");
      }
    } catch (err) {
      console.error("Error loading wedding:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      toast.error("Gagal memuat data wedding");
    } finally {
      setLoading(false);
    }
  };

  return {
    weddingData,
    wedding: weddingData?.wedding || null,
    loading,
    error,
    weddingSlug: slug,
  };
}

/**
 * Hook to fetch wedding by slug (without URL params)
 */
export function useWeddingBySlug(slug: string | undefined): { wedding: Wedding | null; loading: boolean } {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadWedding = async () => {
      setLoading(true);
      const data = await getWeddingBySlug(slug);
      setWedding(data);
      setLoading(false);
    };

    loadWedding();
  }, [slug]);

  return { wedding, loading };
}
