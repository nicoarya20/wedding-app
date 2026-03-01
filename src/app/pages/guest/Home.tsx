import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Heart, Calendar, MapPin, Clock, Loader2, Share2 } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { getPublicEventData, type PublicEventData } from "@/lib/api/admin";
import { getWeddingData } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface HomeProps {
  weddingSlug?: string;
}

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

export function Home({ weddingSlug }: HomeProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
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
        // Convert events to PublicEventData format
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

  // Parse wedding date for countdown
  const weddingDate = useMemo(() => {
    return eventData
      ? new Date(`${eventData.weddingDate}T14:00:00`)
      : new Date("2026-06-15T14:00:00");
  }, [eventData]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

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

  // Get couple names for display
  const getCoupleNames = () => {
    if (!eventData) return "Loading...";
    return eventData.coupleName;
  };

  // WhatsApp share handler
  const handleShare = () => {
    if (!eventData || !eventData.weddingDate) return;

    const weddingUrl = weddingSlug
      ? `${window.location.origin}/w/${weddingSlug}`
      : window.location.origin;

    const message = `💍 Undangan Pernikahan ${eventData.coupleName}\n\n` +
      `Kepada Yth. Bapak/Ibu/Saudara/i,\n` +
      `Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk menghadiri acara pernikahan kami.\n\n` +
      `📅 Tanggal: ${formatDate(eventData.weddingDate)}\n` +
      `🏛️ Akad: ${eventData.akadTime}\n` +
      `🎉 Resepsi: ${eventData.resepsiTime}\n` +
      `📍 Lokasi: ${eventData.resepsiLocation}\n\n` +
      `Untuk informasi lebih lanjut, silakan kunjungi:\n${weddingUrl}\n\n` +
      `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.\n\n` +
      `Terima kasih 🙏`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768900043796-5ca3c0fe760b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwcm9tYW50aWMlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE1Nzc5NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Wedding Couple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-sm tracking-widest mb-4 opacity-90">THE WEDDING OF</p>
            <h1 className="text-5xl mb-2 font-serif">
              {loading ? (
                <span className="flex items-center justify-center gap-2 text-3xl">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Loading...
                </span>
              ) : (
                getCoupleNames()
              )}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4 mb-8">
              <div className="h-px w-12 bg-white/50" />
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <div className="h-px w-12 bg-white/50" />
            </div>
            <p className="text-lg opacity-90">
              {eventData && eventData.weddingDate ? formatDate(eventData.weddingDate) : "15 Juni 2026"}
            </p>
            
            {/* Share Button */}
            {!loading && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
                onClick={handleShare}
                className="mt-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Bagikan Undangan</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Countdown Section */}
      <div className="bg-white py-12 px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <h2 className="text-2xl mb-2 text-gray-800">Menghitung Hari</h2>
          <p className="text-sm text-gray-600 mb-8">Sampai hari bahagia kami</p>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-1">{countdown.days}</div>
              <div className="text-xs opacity-90">Hari</div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-1">{countdown.hours}</div>
              <div className="text-xs opacity-90">Jam</div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-1">{countdown.minutes}</div>
              <div className="text-xs opacity-90">Menit</div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-1">{countdown.seconds}</div>
              <div className="text-xs opacity-90">Detik</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Info Section */}
      <div className="bg-gradient-to-b from-rose-50 to-white py-12 px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-rose-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-500 mb-1">Tanggal</h3>
                <p className="text-gray-900">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    eventData && eventData.weddingDate ? formatDate(eventData.weddingDate) : defaultEventData.weddingDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-rose-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-500 mb-1">Waktu</h3>
                <p className="text-gray-900">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    eventData ? eventData.resepsiTime : defaultEventData.resepsiTime
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-rose-100 rounded-full p-3">
                <MapPin className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-500 mb-1">Lokasi</h3>
                <p className="text-gray-900">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    eventData ? eventData.resepsiLocation : defaultEventData.resepsiLocation
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Love Story Preview */}
      <div className="bg-white py-12 px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <h2 className="text-2xl mb-4 text-gray-800">Kisah Cinta Kami</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Perjalanan cinta kami dimulai 5 tahun yang lalu. Dari pertemanan menjadi 
            cinta yang dalam, kami telah melewati banyak momen indah bersama. 
            Kini saatnya kami mengikat janji suci di hadapan Tuhan dan orang-orang terkasih.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
