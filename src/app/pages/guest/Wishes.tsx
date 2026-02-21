import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  useEffect(() => {
    loadWishes();
  }, []);

  const loadWishes = () => {
    const storedWishes = JSON.parse(localStorage.getItem("wishes") || "[]");
    setWishes(storedWishes.sort((a: Wish, b: Wish) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.message) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    const newWish: Wish = {
      id: Date.now().toString(),
      name: formData.name,
      message: formData.message,
      createdAt: new Date().toISOString(),
    };

    const storedWishes = JSON.parse(localStorage.getItem("wishes") || "[]");
    storedWishes.push(newWish);
    localStorage.setItem("wishes", JSON.stringify(storedWishes));

    setWishes([newWish, ...wishes]);
    setFormData({ name: "", message: "" });
    toast.success("Ucapan berhasil dikirim!");
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
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Kirim Ucapan
            </button>
          </div>
        </motion.form>

        {/* Wishes List */}
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
      </div>
    </div>
  );
}
