import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Navigation, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getPublicEventData, type PublicEventData } from "@/lib/api/admin";
import { getWeddingData } from "@/lib/api/multi-tenant";
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

export function EventDetails({ weddingSlug }: EventDetailsProps) {
  const [eventData, setEventData] = useState<PublicEventData | null>(null);
  const [loading, setLoading] = useState(true);

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
      setEventData(data || defaultEventData);
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

  // Build events array from database data
  const getEvents = () => {
    if (!eventData) return [];

    return [
      {
        title: "Akad Nikah",
        date: formatDate(eventData.weddingDate),
        time: eventData.akadTime,
        location: eventData.akadLocation,
        address: eventData.akadAddress,
        image: akadImage,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.akadLocation + " " + eventData.akadAddress)}`,
      },
      {
        title: "Resepsi Pernikahan",
        date: formatDate(eventData.weddingDate),
        time: eventData.resepsiTime,
        location: eventData.resepsiLocation,
        address: eventData.resepsiAddress,
        image: resepsiImage,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.resepsiLocation + " " + eventData.resepsiAddress)}`,
      },
    ];
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
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat detail acara...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {getEvents().map((event, index) => (
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
                    <div className="bg-rose-100 rounded-full p-2 mt-1">
                      <Calendar className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Tanggal</p>
                      <p className="text-gray-900">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-rose-100 rounded-full p-2 mt-1">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Waktu</p>
                      <p className="text-gray-900">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-rose-100 rounded-full p-2 mt-1">
                      <MapPin className="w-5 h-5 text-rose-600" />
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
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl py-3 mt-4 hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    <Navigation className="w-5 h-5" />
                    Buka di Google Maps
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dress Code */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 text-center"
        >
          <h3 className="text-xl mb-3 text-gray-800">Dress Code</h3>
          <p className="text-gray-600 mb-4">
            Kami mengharapkan tamu undangan mengenakan pakaian formal dengan nuansa:
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-rose-300 border-2 border-white shadow-md" />
            <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-white shadow-md" />
            <div className="w-12 h-12 rounded-full bg-purple-200 border-2 border-white shadow-md" />
            <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-white shadow-md" />
          </div>
          <p className="text-sm text-gray-500">Rose, Pink, Purple, Blue</p>
        </motion.div>
      </div>
    </div>
  );
}
