import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Search, Heart, Trash2, Loader2, RefreshCw, Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { getWishes, deleteWish, type Wish as ApiWish } from "@/lib/api/admin";
import { toast } from "sonner";

interface Wish extends ApiWish {}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
}

export function WishesManagement() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    loadWishes();
  }, [navigate]);

  const loadWishes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await getWishes(searchQuery);
      setWishes(data);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        toast.success("Data berhasil di-refresh");
      }
    } catch (error) {
      console.error("Error loading wishes:", error);
      toast.error("Gagal memuat data ucapan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, searchQuery]);

  // Debounced search - triggers on searchQuery change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !refreshing) {
        loadWishes();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus ucapan ini?")) {
      setDeletingId(id);
      try {
        const success = await deleteWish(id);
        if (success) {
          await loadWishes();
          toast.success("Ucapan berhasil dihapus");
        } else {
          toast.error("Gagal menghapus ucapan");
        }
      } finally {
        setDeletingId(null);
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
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl text-gray-800">Ucapan & Doa</h1>
            <button
              onClick={() => loadWishes(true)}
              disabled={refreshing}
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Kelola ucapan dari tamu undangan</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Terakhir diupdate: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
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
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-semibold text-gray-900">{wishes.length}</span> ucapan
            </div>
            {wishes.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>Dari tamu yang berbahagia</span>
              </div>
            )}
          </div>
        )}

        {/* Wishes List */}
        {!loading && (
          <div className="space-y-4">
            {wishes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-md p-12 text-center"
              >
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-10 h-10 text-rose-600" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">Belum ada ucapan</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery 
                    ? "Tidak ada ucapan yang sesuai dengan pencarian"
                    : "Ucapan dari tamu akan muncul di sini"
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Hapus pencarian
                  </button>
                )}
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
                          disabled={deletingId === wish.id}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hapus ucapan"
                        >
                          {deletingId === wish.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
