import { motion } from "motion/react";
import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-8">
          <h1 className="text-9xl text-rose-500 mb-4">404</h1>
          <h2 className="text-2xl text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600">
            Maaf, halaman yang Anda cari tidak tersedia.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all shadow-md border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Halaman Sebelumnya
          </button>
        </div>
      </motion.div>
    </div>
  );
}
