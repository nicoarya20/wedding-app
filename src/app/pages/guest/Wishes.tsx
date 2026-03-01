import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWishes as getWishesGlobal, submitWish as submitWishGlobal, type Wish as ApiWish, type SubmitWish } from "@/lib/api/admin";
import { getWishesByWeddingId, submitWish as submitWishMultiTenant, getWeddingData, type WeddingData } from "@/lib/api/multi-tenant";

interface WishesProps {
  weddingSlug?: string;
}

interface Wish extends ApiWish {}

// Theme color mappings (same as other pages)
const themeColors: Record<string, { primary: string; secondary: string; gradient: string }> = {
  rose: { primary: "#e11d48", secondary: "#ec4899", gradient: "from-rose-500 to-pink-500" },
  green: { primary: "#059669", secondary: "#10b981", gradient: "from-emerald-500 to-green-500" },
  blue: { primary: "#0284c7", secondary: "#38bdf8", gradient: "from-blue-500 to-cyan-500" },
  purple: { primary: "#7c3aed", secondary: "#a855f7", gradient: "from-purple-500 to-violet-500" },
  gold: { primary: "#b45309", secondary: "#f59e0b", gradient: "from-amber-600 to-yellow-500" },
  red: { primary: "#dc2626", secondary: "#ef4444", gradient: "from-red-600 to-red-400" },
  teal: { primary: "#0d9488", secondary: "#14b8a6", gradient: "from-teal-600 to-cyan-500" },
  indigo: { primary: "#4f46e5", secondary: "#6366f1", gradient: "from-indigo-600 to-blue-500" },
};

export function Wishes({ weddingSlug }: WishesProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [weddingConfig, setWeddingConfig] = useState<WeddingData["wedding"] | null>(null);

  // Get theme colors
  const theme = weddingConfig?.theme || "rose";
  const colors = themeColors[theme] || themeColors.rose;
  const fontFamily = weddingConfig?.fontFamily || "serif";

  useEffect(() => {
    if (weddingSlug) {
      loadWeddingConfig(weddingSlug);
    }
  }, [weddingSlug]);

  const loadWeddingConfig = async (slug: string) => {
    try {
      const data = await getWeddingData(slug);
      if (data) {
        setWeddingConfig(data.wedding);
      }
    } catch (error) {
      console.error("Error loading wedding config:", error);
    }
  };

  const loadWishes = useCallback(async () => {
    try {
      setLoading(true);
      // Use multi-tenant API if weddingSlug is provided
      const fetchFn = weddingSlug ? getWishesByWeddingId : getWishesGlobal;
      const data = await fetchFn(weddingSlug || undefined as any);
      setWishes(data);
    } catch (error) {
      console.error("Error loading wishes:", error);
      toast.error("Gagal memuat ucapan");
    } finally {
      setLoading(false);
    }
  }, [weddingSlug]);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.message) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    setSubmitting(true);

    try {
      const wishData: SubmitWish = {
        weddingId: weddingSlug || undefined,
        name: formData.name,
        message: formData.message,
      };

      // Use multi-tenant API if weddingSlug is provided
      const submitFn = weddingSlug ? submitWishMultiTenant : submitWishGlobal;
      const result = await submitFn(wishData);

      if (result.success) {
        await loadWishes();
        setFormData({ name: "", message: "" });
        toast.success("Ucapan berhasil dikirim!");
      } else {
        toast.error(result.error || "Gagal mengirim ucapan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting wish:", error);
      toast.error("Gagal mengirim ucapan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date string and ensure we handle timezone correctly
    // Add 'Z' suffix if not present to ensure UTC parsing
    const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    
    // Get time difference in seconds
    const diffInSeconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000);

    if (diffInSeconds < 0) return "Baru saja"; // Future date (timezone edge case)
    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  return (
    <div
      className="min-h-screen pt-6 pb-24 px-6"
      style={{ fontFamily }}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl mb-2 text-gray-800">Ucapan & Doa</h1>
          <p className="text-gray-600">
            Kirimkan ucapan dan doa terbaik untuk kami
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-6 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="wishName" className="block text-sm text-gray-700 mb-2">
                Nama Anda
              </label>
              <input
                type="text"
                id="wishName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 wishes-focus-ring"
                style={{ '--focus-ring-color': colors.primary } as React.CSSProperties}
                placeholder="Masukkan nama Anda"
              />
            </div>

            <div>
              <label htmlFor="wishMessage" className="block text-sm text-gray-700 mb-2">
                Ucapan & Doa
              </label>
              <textarea
                id="wishMessage"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 wishes-focus-ring resize-none"
                style={{ '--focus-ring-color': colors.primary } as React.CSSProperties}
                placeholder="Tuliskan ucapan dan doa terbaik..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Ucapan
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
            <span className="ml-2 text-gray-600">Memuat ucapan...</span>
          </div>
        )}

        {/* Wishes List */}
        {!loading && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MessageSquare className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="text-sm">{wishes.length} Ucapan</span>
            </div>

            {wishes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: colors.primary, opacity: 0.3 }} />
                <p className="text-gray-500">Belum ada ucapan</p>
                <p className="text-sm text-gray-400 mt-1">
                  Jadilah yang pertama mengirimkan ucapan
                </p>
              </div>
            ) : (
              wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-md p-5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                      }}
                    >
                      <Heart className="w-5 h-5" style={{ color: colors.primary, fill: colors.primary }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-gray-900">{wish.name}</h3>
                        <span className="text-xs text-gray-400">
                          {formatDate(wish.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {wish.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
