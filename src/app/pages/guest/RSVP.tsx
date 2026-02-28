import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Users, Phone, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitRSVP as submitRSVPGlobal, type SubmitRSVP as RSVPData } from "@/lib/api/admin";
import { submitRSVP as submitRSVPMultiTenant } from "@/lib/api/multi-tenant";

interface RSVPProps {
  weddingSlug?: string;
}

export function RSVP({ weddingSlug }: RSVPProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    attendance: "",
    guestCount: "1",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }
    if (!formData.attendance) {
      toast.error("Konfirmasi kehadiran wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      const rsvpData: RSVPData = {
        weddingId: weddingSlug || undefined,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        attendance: formData.attendance,
        guestCount: formData.attendance === "hadir" ? formData.guestCount : null,
        message: formData.message || null,
      };

      // Use multi-tenant API if weddingSlug is provided
      const submitFn = weddingSlug ? submitRSVPMultiTenant : submitRSVPGlobal;
      const result = await submitFn(rsvpData);

      if (result.success) {
        setSubmitted(true);
        toast.success("RSVP berhasil dikirim!");
      } else {
        toast.error(result.error || "Gagal mengirim RSVP. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast.error("Gagal mengirim RSVP. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl mb-3 text-gray-800">Terima Kasih!</h2>
            <p className="text-gray-600 mb-6">
              Konfirmasi kehadiran Anda telah kami terima. Kami sangat menantikan 
              kehadiran Anda di hari bahagia kami.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Kirim RSVP Lagi
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl mb-2 text-gray-800">RSVP</h1>
          <p className="text-gray-600">
            Konfirmasi kehadiran Anda di acara pernikahan kami
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-6 space-y-5"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Attendance */}
          <div>
            <label htmlFor="attendance" className="block text-sm text-gray-700 mb-2">
              Konfirmasi Kehadiran <span className="text-rose-500">*</span>
            </label>
            <select
              id="attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Pilih konfirmasi kehadiran</option>
              <option value="hadir">Ya, saya akan hadir</option>
              <option value="tidak-hadir">Maaf, saya tidak bisa hadir</option>
              <option value="belum-pasti">Belum pasti</option>
            </select>
          </div>

          {/* Guest Count */}
          {formData.attendance === "hadir" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="guestCount" className="block text-sm text-gray-700 mb-2">
                Jumlah Tamu
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="guestCount"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="1">1 orang</option>
                  <option value="2">2 orang</option>
                  <option value="3">3 orang</option>
                  <option value="4">4 orang</option>
                  <option value="5">5+ orang</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
              Pesan untuk Mempelai
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              placeholder="Tuliskan ucapan dan doa untuk kami..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Konfirmasi"
            )}
          </button>
        </motion.form>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p>Konfirmasi paling lambat H-7 sebelum acara</p>
        </motion.div>
      </div>
    </div>
  );
}
