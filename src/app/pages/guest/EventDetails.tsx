import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Navigation, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getPublicEventData, type PublicEventData } from "@/lib/api/admin";
import { getWeddingData, type Event as ApiEvent, type WeddingData } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface EventDetailsProps {
  weddingSlug?: string;
}

// Default fallback images
const akadImage = "https://images.unsplash.com/photo-1767986012138-4893f40932d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjB2ZW51ZSUyMGVsZWdhbnR8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const resepsiImage = "https://images.unsplash.com/photo-1768777270963-8289ea9d870d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGVjb3JhdGlvbiUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080";

// Default fallback data
const defaultEventData: PublicEventData = {
  coupleName: "Sarah & Michael",
  weddingDate: "2026-06-15",
  akadTime: "09:00 - 11:00 WIB",
  akadLocation: "Masjid Al-Ikhlas",
  akadAddress: "Jl. Sudirman No. 123, Jakarta Pusat",
  resepsiTime: "14:00 - 17:00 WIB",
  resepsiLocation: "The Grand Ballroom",
  resepsiAddress: "Jl. Thamrin No. 456, Jakarta Pusat",
};

// Theme color mappings (same as Home.tsx)
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

interface EventDisplay {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  image: string;
  mapUrl: string;
  type: string;
}

export function EventDetails({ weddingSlug }: EventDetailsProps) {
  const [eventData, setEventData] = useState<PublicEventData | null>(null);
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [weddingConfig, setWeddingConfig] = useState<WeddingData["wedding"] | null>(null);
  const [loading, setLoading] = useState(true);

  // Get theme colors
  const theme = weddingConfig?.theme || "rose";
  const colors = themeColors[theme] || themeColors.rose;
  const fontFamily = weddingConfig?.fontFamily || "serif";

  useEffect(() => {
    if (weddingSlug) {
      loadWeddingData(weddingSlug);
    } else {
      loadEventData();
    }
  }, [weddingSlug]);

  const loadWeddingData = async (slug: string) => {
    try {
      setLoading(true);
      const data = await getWeddingData(slug);
      if (data) {
        // Set wedding configuration
        setWeddingConfig(data.wedding);

        // Set basic event data
        const akadEvent = data.events.find(e => e.type === "akad");
        const resepsiEvent = data.events.find(e => e.type === "resepsi");

        setEventData({
          coupleName: data.wedding.coupleName,
          weddingDate: data.wedding.weddingDate,
          akadTime: akadEvent ? `${akadEvent.time}` : "TBA",
          akadLocation: akadEvent?.location || "TBA",
          akadAddress: akadEvent?.address || "",
          resepsiTime: resepsiEvent ? `${resepsiEvent.time}` : "TBA",
          resepsiLocation: resepsiEvent?.location || "TBA",
          resepsiAddress: resepsiEvent?.address || "",
        });

        // Build events array from database with full data
        const eventDisplays: EventDisplay[] = [];

        if (akadEvent) {
          eventDisplays.push({
            title: "Akad Nikah",
            type: "akad",
            date: formatDate(akadEvent.date || data.wedding.weddingDate),
            time: akadEvent.time,
            location: akadEvent.location,
            address: akadEvent.address,
            image: akadEvent.imageUrl || akadImage,
            mapUrl: akadEvent.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(akadEvent.location + " " + akadEvent.address)}`,
          });
        }

        if (resepsiEvent) {
          eventDisplays.push({
            title: "Resepsi Pernikahan",
            type: "resepsi",
            date: formatDate(resepsiEvent.date || data.wedding.weddingDate),
            time: resepsiEvent.time,
            location: resepsiEvent.location,
            address: resepsiEvent.address,
            image: resepsiEvent.imageUrl || resepsiImage,
            mapUrl: resepsiEvent.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resepsiEvent.location + " " + resepsiEvent.address)}`,
          });
        }

        setEvents(eventDisplays);
      }
    } catch (error) {
      console.error("Error loading wedding data:", error);
      toast.error("Gagal memuat data wedding");
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async () => {
    try {
      setLoading(true);
      const data = await getPublicEventData();
      const fallbackData = data || defaultEventData;
      setEventData(fallbackData);

      // Build events array from fallback data
      setEvents([
        {
          title: "Akad Nikah",
          type: "akad",
          date: formatDate(fallbackData.weddingDate),
          time: fallbackData.akadTime,
          location: fallbackData.akadLocation,
          address: fallbackData.akadAddress,
          image: akadImage,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackData.akadLocation + " " + fallbackData.akadAddress)}`,
        },
        {
          title: "Resepsi Pernikahan",
          type: "resepsi",
          date: formatDate(fallbackData.weddingDate),
          time: fallbackData.resepsiTime,
          location: fallbackData.resepsiLocation,
          address: fallbackData.resepsiAddress,
          image: resepsiImage,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackData.resepsiLocation + " " + fallbackData.resepsiAddress)}`,
        },
      ]);
    } catch (error) {
      console.error("Error loading event data:", error);
      setEventData(defaultEventData);
      toast.error("Gagal memuat data acara");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen pt-6 pb-24 px-6"
      style={{
        fontFamily: fontFamily,
        '--primary-color': colors.primary,
        '--secondary-color': colors.secondary,
      } as React.CSSProperties}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl mb-2 text-gray-800">
            {loading ? (
              <span className="flex items-center justify-center gap-2 text-2xl">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading...
              </span>
            ) : (
              "Detail Acara"
            )}
          </h1>
          <p className="text-gray-600">Informasi lengkap acara pernikahan kami</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
            <span className="ml-2 text-gray-600">Memuat detail acara...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: colors.primary }} />
                <p>Belum ada informasi acara</p>
              </div>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h2 className="absolute bottom-4 left-4 text-2xl text-white">
                      {event.title}
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 mt-1" style={{ backgroundColor: `${colors.primary}20` }}>
                        <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tanggal</p>
                        <p className="text-gray-900">{event.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 mt-1" style={{ backgroundColor: `${colors.primary}20` }}>
                        <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Waktu</p>
                        <p className="text-gray-900">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 mt-1" style={{ backgroundColor: `${colors.primary}20` }}>
                        <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Lokasi</p>
                        <p className="text-gray-900">{event.location}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.address}</p>
                      </div>
                    </div>

                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl py-3 mt-4 transition-all text-white"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Navigation className="w-5 h-5" />
                      Buka di Google Maps
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Dress Code */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 rounded-3xl p-6 text-center"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`,
          }}
        >
          <h3 className="text-xl mb-3 text-gray-800">Dress Code</h3>
          <p className="text-gray-600 mb-4">
            Kami mengharapkan tamu undangan mengenakan pakaian formal dengan nuansa:
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: colors.primary }} />
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: colors.secondary }} />
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: `${colors.primary}80` }} />
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: `${colors.secondary}80` }} />
          </div>
          <p className="text-sm text-gray-500">Sesuai dengan tema wedding</p>
        </motion.div>
      </div>
    </div>
  );
}
