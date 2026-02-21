import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function EventDetails() {
  const events = [
    {
      title: "Akad Nikah",
      date: "Minggu, 15 Juni 2026",
      time: "09:00 - 11:00 WIB",
      location: "Masjid Al-Ikhlas",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      image: "https://images.unsplash.com/photo-1767986012138-4893f40932d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjB2ZW51ZSUyMGVsZWdhbnR8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      mapUrl: "https://www.google.com/maps?q=Masjid+Al-Ikhlas+Jakarta",
    },
    {
      title: "Resepsi Pernikahan",
      date: "Minggu, 15 Juni 2026",
      time: "14:00 - 17:00 WIB",
      location: "The Grand Ballroom",
      address: "Jl. Thamrin No. 456, Jakarta Pusat",
      image: "https://images.unsplash.com/photo-1768777270963-8289ea9d870d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZGVjb3JhdGlvbiUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNjg1MDU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      mapUrl: "https://www.google.com/maps?q=The+Grand+Ballroom+Jakarta",
    },
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl mb-2 text-gray-800">Detail Acara</h1>
          <p className="text-gray-600">Informasi lengkap acara pernikahan kami</p>
        </motion.div>

        <div className="space-y-6">
          {events.map((event, index) => (
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
