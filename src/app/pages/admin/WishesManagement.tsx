import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Heart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export function WishesManagement() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    loadWishes();
  }, [navigate]);

  const loadWishes = () => {
    const storedWishes = JSON.parse(localStorage.getItem("wishes") || "[]");
    setWishes(storedWishes.sort((a: Wish, b: Wish) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus ucapan ini?")) {
      const updatedWishes = wishes.filter((wish) => wish.id !== id);
      localStorage.setItem("wishes", JSON.stringify(updatedWishes));
      setWishes(updatedWishes);
      toast.success("Ucapan berhasil dihapus");
    }
  };

  const filteredWishes = wishes.filter((wish) =>
    wish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wish.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        {/* Search */}
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

        {/* Wish Count */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredWishes.length} dari {wishes.length} ucapan
        </div>

        {/* Wishes List */}
        <div className="space-y-4">
          {filteredWishes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-md p-8 text-center"
            >
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {wishes.length === 0 ? "Belum ada ucapan" : "Tidak ada ucapan yang sesuai dengan pencarian"}
              </p>
            </motion.div>
          ) : (
            filteredWishes.map((wish, index) => (
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
      </div>
    </div>
  );
}
