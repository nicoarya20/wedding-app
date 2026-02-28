import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWishes as getWishesGlobal, submitWish as submitWishGlobal, type Wish as ApiWish, type SubmitWish } from "@/lib/api/admin";
import { getWishesByWeddingId, submitWish as submitWishMultiTenant } from "@/lib/api/multi-tenant";

interface WishesProps {
  weddingSlug?: string;
}

interface Wish extends ApiWish {}

export function Wishes({ weddingSlug }: WishesProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = async () => {
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
  };

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
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                placeholder="Tuliskan ucapan dan doa terbaik..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
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
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">{wishes.length} Ucapan</span>
            </div>

            {wishes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
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
