import { useState } from "react";
import { motion } from "motion/react";
import { Image, X, Loader2 } from "lucide-react";
import { updateWeddingImage } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface UpdateWeddingImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingId: string;
  currentImageUrl: string | null;
  onSuccess: () => void;
}

export function UpdateWeddingImageModal({
  isOpen,
  onClose,
  weddingId,
  currentImageUrl,
  onSuccess,
}: UpdateWeddingImageModalProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      toast.error("Mohon masukkan URL gambar");
      return;
    }

    try {
      setLoading(true);
      const result = await updateWeddingImage(weddingId, imageUrl);

      if (result.success) {
        toast.success("Gambar wedding berhasil diupdate!");
        onSuccess();
        onClose();
        setImageUrl("");
      } else {
        toast.error(result.error || "Gagal mengupdate gambar");
      }
    } catch (error) {
      console.error("Error updating wedding image:", error);
      toast.error("Gagal mengupdate gambar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-12 h-12 flex items-center justify-center">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl text-gray-800">Update Gambar Wedding</h2>
              <p className="text-sm text-gray-600">Ganti gambar utama wedding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Image Preview */}
          {currentImageUrl && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Gambar Saat Ini
              </label>
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={currentImageUrl}
                  alt="Current wedding image"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* New Image URL Input */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm text-gray-700 mb-2">
              URL Gambar Baru <span className="text-purple-500">*</span>
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tips: Gunakan URL dari Unsplash, Pexels, atau layanan hosting gambar lainnya
            </p>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Preview Gambar Baru
              </label>
              <div className="relative rounded-xl overflow-hidden border-2 border-purple-200">
                <img
                  src={imageUrl}
                  alt="New wedding image preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ddd' width='400' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EInvalid URL%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !imageUrl.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
