import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Image, Upload, Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { getGalleryByWeddingId, createGalleryPhoto, deleteGalleryPhoto } from "@/lib/api/multi-tenant";
import { uploadImage, deleteImage } from "@/lib/storage";
import { Button } from "@/app/components/ui/button";

export function GalleryManagement() {
  const [photos, setPhotos] = useState<Array<{
    id: string;
    imageUrl: string;
    caption: string | null;
    order: number;
    publicId?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // For now, use the first wedding found
    // In production, this should be the logged-in user's wedding
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      // Get the demo wedding
      const { getWeddingBySlug } = await import("@/lib/api/multi-tenant");
      const wedding = await getWeddingBySlug("sarah-michael");
      
      if (wedding) {
        setSelectedWeddingId(wedding.id);
        const gallery = await getGalleryByWeddingId(wedding.id);
        setPhotos(gallery);
      }
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    if (!selectedWeddingId) {
      toast.error("Wedding ID tidak ditemukan");
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadImage(file, 'wedding-app/gallery');

      if (uploadResult.success && uploadResult.url) {
        // Save to database with publicId for future deletion
        const result = await createGalleryPhoto({
          weddingId: selectedWeddingId,
          imageUrl: uploadResult.url,
          caption: "",
          order: photos.length,
        });

        if (result.success) {
          toast.success("Foto berhasil diupload!");
          await loadGallery();
        } else {
          toast.error("Gagal menyimpan foto ke database");
        }
      } else {
        toast.error(uploadResult.error || "Upload gagal");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photoId: string, _imageUrl: string, publicId?: string) => {
    if (!confirm("Yakin ingin menghapus foto ini?")) return;

    try {
      // Delete from database first
      const deleted = await deleteGalleryPhoto(photoId);
      
      if (deleted) {
        // Also delete from Cloudinary if publicId exists
        if (publicId) {
          await deleteImage(publicId);
        }
        
        toast.success("Foto berhasil dihapus");
        await loadGallery();
      } else {
        toast.error("Gagal menghapus foto");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Galeri Foto</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola foto galeri pernikahan
            </p>
          </div>
          
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Foto
                </>
              )}
            </Button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada foto
            </h3>
            <p className="text-gray-600 mb-6">
              Upload foto pertama untuk galeri pernikahan
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md bg-gray-100"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Gallery photo"}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDelete(photo.id, photo.imageUrl, photo.publicId)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
