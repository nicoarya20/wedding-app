import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Calendar, MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function Home() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Wedding date - ubah sesuai kebutuhan
  const weddingDate = new Date("2026-06-15T14:00:00");

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
  }, []);

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
            <h1 className="text-5xl mb-2 font-serif">Sarah & Michael</h1>
            <div className="flex items-center justify-center gap-4 mt-4 mb-8">
              <div className="h-px w-12 bg-white/50" />
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <div className="h-px w-12 bg-white/50" />
            </div>
            <p className="text-lg opacity-90">15 Juni 2026</p>
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
                <p className="text-gray-900">Minggu, 15 Juni 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-rose-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-500 mb-1">Waktu</h3>
                <p className="text-gray-900">14:00 - 17:00 WIB</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-rose-100 rounded-full p-3">
                <MapPin className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-gray-500 mb-1">Lokasi</h3>
                <p className="text-gray-900">The Grand Ballroom, Jakarta</p>
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
