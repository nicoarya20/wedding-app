import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getEventData, updateEventData, type EventData as ApiEventData } from "@/lib/api/admin";
import { toast } from "sonner";

interface EventData extends Omit<ApiEventData, "id"> {
  id?: string;
}

// Default values
const defaultEventData: EventData = {
  coupleName: "",
  weddingDate: "",
  akadTime: "",
  akadLocation: "",
  akadAddress: "",
  resepsiTime: "",
  resepsiLocation: "",
  resepsiAddress: "",
};

export function EventManagement() {
  const [eventData, setEventData] = useState<EventData>(defaultEventData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasData, setHasData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminAuthToken")) {
      navigate("/admin");
      return;
    }

    loadEventData();
  }, [navigate]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const data = await getEventData();
      if (data) {
        setEventData({
          ...data,
          id: data.id || undefined,
        });
        setHasData(true);
      } else {
        // No data in database, use defaults
        setEventData(defaultEventData);
        setHasData(false);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Gagal memuat data acara");
      setEventData(defaultEventData);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!eventData.coupleName.trim()) {
      toast.error("Nama pasangan wajib diisi");
      return false;
    }
    if (!eventData.weddingDate) {
      toast.error("Tanggal pernikahan wajib diisi");
      return false;
    }
    if (!eventData.akadTime.trim()) {
      toast.error("Waktu akad wajib diisi");
      return false;
    }
    if (!eventData.akadLocation.trim()) {
      toast.error("Lokasi akad wajib diisi");
      return false;
    }
    if (!eventData.akadAddress.trim()) {
      toast.error("Alamat akad wajib diisi");
      return false;
    }
    if (!eventData.resepsiTime.trim()) {
      toast.error("Waktu resepsi wajib diisi");
      return false;
    }
    if (!eventData.resepsiLocation.trim()) {
      toast.error("Lokasi resepsi wajib diisi");
      return false;
    }
    if (!eventData.resepsiAddress.trim()) {
      toast.error("Alamat resepsi wajib diisi");
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const success = await updateEventData(eventData);
      if (success) {
        toast.success("Data acara berhasil disimpan!");
        setHasData(true);
      } else {
        toast.error("Gagal menyimpan data acara");
      }
    } catch (error) {
      console.error("Error saving event data:", error);
      toast.error("Gagal menyimpan data acara");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-2xl text-gray-800 mb-1">Kelola Acara</h1>
          <p className="text-gray-600">Ubah detail acara pernikahan</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
          {/* General Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg text-gray-800 mb-4">Informasi Umum</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="coupleName" className="block text-sm text-gray-700 mb-2">
                  Nama Pasangan
                </label>
                <input
                  type="text"
                  id="coupleName"
                  name="coupleName"
                  value={eventData.coupleName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Contoh: Sarah & Michael"
                />
              </div>

              <div>
                <label htmlFor="weddingDate" className="block text-sm text-gray-700 mb-2">
                  Tanggal Pernikahan
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    id="weddingDate"
                    name="weddingDate"
                    value={eventData.weddingDate}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Akad Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg text-gray-800 mb-4">Akad Nikah</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="akadTime" className="block text-sm text-gray-700 mb-2">
                  Waktu Akad
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="akadTime"
                    name="akadTime"
                    value={eventData.akadTime}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: 09:00 - 11:00 WIB"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="akadLocation" className="block text-sm text-gray-700 mb-2">
                  Lokasi Akad
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="akadLocation"
                    name="akadLocation"
                    value={eventData.akadLocation}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Nama tempat"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="akadAddress" className="block text-sm text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  id="akadAddress"
                  name="akadAddress"
                  value={eventData.akadAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Resepsi Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg text-gray-800 mb-4">Resepsi Pernikahan</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="resepsiTime" className="block text-sm text-gray-700 mb-2">
                  Waktu Resepsi
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="resepsiTime"
                    name="resepsiTime"
                    value={eventData.resepsiTime}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: 14:00 - 17:00 WIB"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="resepsiLocation" className="block text-sm text-gray-700 mb-2">
                  Lokasi Resepsi
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="resepsiLocation"
                    name="resepsiLocation"
                    value={eventData.resepsiLocation}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Nama tempat"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="resepsiAddress" className="block text-sm text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  id="resepsiAddress"
                  name="resepsiAddress"
                  value={eventData.resepsiAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </motion.form>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`mt-6 rounded-2xl p-4 ${
            hasData ? "bg-green-50" : "bg-blue-50"
          }`}
        >
          <p className={`text-sm ${hasData ? "text-green-800" : "text-blue-800"}`}>
            <strong>Catatan:</strong>{" "}
            {hasData 
              ? "Data tersimpan di database Supabase. Klik 'Simpan Perubahan' untuk update."
              : "Belum ada data acara. Silakan lengkapi form di atas untuk membuat data acara pertama kali."
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}
