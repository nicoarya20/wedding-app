import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Search, Filter, CheckCircle, XCircle, HelpCircle, Mail, Phone, Loader2, RefreshCw, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { getGuests, type Guest as ApiGuest } from "@/lib/api/admin";
import { toast } from "sonner";

interface Guest extends ApiGuest {}

export function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const loadGuests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getGuests(searchQuery, filter);
      setGuests(data);
      setLastUpdated(new Date());

      if (isRefresh) {
        toast.success("Data berhasil di-refresh");
      }
    } catch (error) {
      console.error("Error loading guests:", error);
      toast.error("Gagal memuat data tamu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminAuthToken")) {
      navigate("/admin");
      return;
    }

    loadGuests();
  }, [navigate, loadGuests]);

  // Debounced search - triggers on searchQuery change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !refreshing) {
        loadGuests();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter change - triggers on filter change
  useEffect(() => {
    if (!loading && !refreshing) {
      loadGuests();
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAttendanceIcon = (attendance: string) => {
    switch (attendance) {
      case "hadir":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "tidak-hadir":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "belum-pasti":
        return <HelpCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getAttendanceLabel = (attendance: string) => {
    switch (attendance) {
      case "hadir":
        return "Hadir";
      case "tidak-hadir":
        return "Tidak Hadir";
      case "belum-pasti":
        return "Belum Pasti";
      default:
        return attendance;
    }
  };

  const getAttendanceBadgeColor = (attendance: string) => {
    switch (attendance) {
      case "hadir":
        return "bg-green-100 text-green-800";
      case "tidak-hadir":
        return "bg-red-100 text-red-800";
      case "belum-pasti":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Nama", "Email", "Telepon", "Status Kehadiran", "Jumlah Tamu", "Pesan", "Tanggal RSVP"];
    const rows = guests.map(guest => [
      `"${guest.name}"`,
      `"${guest.email || ""}"`,
      `"${guest.phone || ""}"`,
      guest.attendance,
      guest.attendance === "hadir" ? (guest.guestCount || "0") : "",
      `"${(guest.message || "").replace(/"/g, '""')}"`,
      new Date(guest.createdAt).toLocaleString("id-ID"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `guest-list-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data tamu berhasil diexport ke CSV!");
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl text-gray-800 mb-1">Daftar Tamu</h1>
              <p className="text-gray-600">Kelola konfirmasi kehadiran tamu</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                disabled={guests.length === 0}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export ke CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => loadGuests(true)}
                disabled={refreshing}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Kelola konfirmasi kehadiran tamu</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Terakhir diupdate: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}

        {/* Search and Filter */}
        {!loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-md p-4 mb-6"
          >
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Cari nama tamu..."
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="tidak-hadir">Tidak Hadir</option>
                <option value="belum-pasti">Belum Pasti</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Guest Count */}
        {!loading && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{guests.length}</span> tamu
            </div>
            {guests.length > 0 && (
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Hadir: {guests.filter(g => g.attendance === "hadir").length}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                  Tidak Hadir: {guests.filter(g => g.attendance === "tidak-hadir").length}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Belum Pasti: {guests.filter(g => g.attendance === "belum-pasti").length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Guest List */}
        {!loading && (
          <div className="space-y-4">
            {guests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-md p-8 text-center"
              >
                <p className="text-gray-500">Belum ada tamu yang RSVP</p>
              </motion.div>
            ) : (
              guests.map((guest, index) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-md p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{guest.name}</h3>
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(guest.attendance)}
                        <span className={`text-xs px-2.5 py-1 rounded-full ${getAttendanceBadgeColor(guest.attendance)}`}>
                          {getAttendanceLabel(guest.attendance)}
                        </span>
                        {guest.attendance === "hadir" && guest.guestCount && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                            {guest.guestCount} orang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(guest.email || guest.phone) && (
                    <div className="space-y-2 mb-3">
                      {guest.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  {guest.message && (
                    <div className="bg-gray-50 rounded-xl p-3 mt-3">
                      <p className="text-sm text-gray-700 italic">"{guest.message}"</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-3 text-xs text-gray-400">
                    {formatDate(guest.createdAt)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
