import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Heart, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getWishes, deleteWish, type Wish as ApiWish } from "@/lib/api/admin";
import { toast } from "sonner";

interface Wish extends ApiWish {}

export function WishesManagement() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    loadWishes();
  }, [navigate]);

  const loadWishes = async () => {
    try {
      setLoading(true);
      const data = await getWishes(searchQuery);
      setWishes(data);
    } catch (error) {
      console.error("Error loading wishes:", error);
      toast.error("Gagal memuat data ucapan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus ucapan ini?")) {
      const success = await deleteWish(id);
      if (success) {
        await loadWishes();
        toast.success("Ucapan berhasil dihapus");
      } else {
        toast.error("Gagal menghapus ucapan");
      }
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-2xl text-gray-800 mb-1">Ucapan & Doa</h1>
          <p className="text-gray-600">Kelola ucapan dari tamu undangan</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}

        {/* Search */}
        {!loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Cari ucapan..."
              />
            </div>
          </motion.div>
        )}

        {/* Wish Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan {wishes.length} ucapan
          </div>
        )}

        {/* Wishes List */}
        {!loading && (
          <div className="space-y-4">
            {wishes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-8 text-center"
              >
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada ucapan</p>
              </motion.div>
            ) : (
              wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-md p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-gray-900">{wish.name}</h3>
                        <button
                          onClick={() => handleDelete(wish.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Hapus ucapan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-2">
                        {wish.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(wish.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
