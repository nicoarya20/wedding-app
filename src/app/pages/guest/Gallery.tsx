import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getGalleryByWeddingId, getWeddingData, type WeddingData } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface GalleryProps {
  weddingSlug?: string;
}

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

export function Gallery({ weddingSlug }: GalleryProps) {
  const [photos, setPhotos] = useState<Array<{ url: string; caption?: string; tall?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [weddingConfig, setWeddingConfig] = useState<WeddingData["wedding"] | null>(null);

  // Get theme colors
  const theme = weddingConfig?.theme || "rose";
  const colors = themeColors[theme] || themeColors.rose;
  const fontFamily = weddingConfig?.fontFamily || "serif";

  useEffect(() => {
    if (weddingSlug) {
      loadWeddingGallery(weddingSlug);
      loadWeddingConfig(weddingSlug);
    } else {
      // Use hardcoded photos for non-wedding routes
      setPhotos([
        {
          url: "https://images.unsplash.com/photo-1768900043796-5ca3c0fe760b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwcm9tYW50aWMlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE1Nzc5NzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          caption: "Our Love Story",
          tall: true,
        },
        {
          url: "https://images.unsplash.com/photo-1769038942266-128df3805a8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMHdlZGRpbmclMjBjb3VwbGUlMjBoYW5kc3xlbnwxfHx8fDE3NzE2ODUwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
          caption: "Together Forever",
        },
        {
          url: "https://images.unsplash.com/photo-1767986012138-4893f40932d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjB2ZW51ZSUyMGVsZWdhbnR8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
          caption: "Special Moments",
        },
        {
          url: "https://images.unsplash.com/photo-1768777270963-8289ea9d870d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGVjb3JhdGlvbiUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
          caption: "Beautiful Setup",
          tall: true,
        },
      ]);
      setLoading(false);
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

  const loadWeddingGallery = async (slug: string) => {
    try {
      setLoading(true);
      // We need wedding ID first
      const { getWeddingBySlug } = await import("@/lib/api/multi-tenant");
      const wedding = await getWeddingBySlug(slug);
      
      if (wedding) {
        const gallery = await getGalleryByWeddingId(wedding.id);
        setPhotos(gallery.map(g => ({
          url: g.imageUrl,
          caption: g.caption || undefined,
          tall: g.order % 3 === 0, // Make every 3rd photo tall
        })));
      }
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl mb-2 text-gray-800">Galeri Foto</h1>
          <p className="text-gray-600">Momen indah dalam perjalanan cinta kami</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: colors.primary }}
            />
          </div>
        ) : (
          /* Masonry Grid */
          <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow ${
                photo.tall ? "row-span-2" : ""
              }`}
            >
              <ImageWithFallback
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm">{photo.caption}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Quote Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl p-8 text-center"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`,
          }}
        >
          <p className="text-lg text-gray-700 italic mb-3">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu
            pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram
            kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
          </p>
          <p className="text-sm text-gray-600">- QS. Ar-Rum: 21</p>
        </motion.div>
      </div>
    </div>
  );
}
