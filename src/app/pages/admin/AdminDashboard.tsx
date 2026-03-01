import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, CheckCircle, XCircle, HelpCircle, MessageSquare, Loader2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { getDashboardStats, type DashboardStats as ApiDashboardStats } from "@/lib/api/admin";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface Stats extends ApiDashboardStats {}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0,
    attending: 0,
    notAttending: 0,
    uncertain: 0,
    totalWishes: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated using JWT token
    const authToken = localStorage.getItem("adminAuthToken");
    if (!authToken) {
      navigate("/admin");
      return;
    }

    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for pie chart
  const pieData = [
    { name: "Hadir", value: stats.attending, color: "#22c55e" },
    { name: "Tidak Hadir", value: stats.notAttending, color: "#ef4444" },
    { name: "Belum Pasti", value: stats.uncertain, color: "#eab308" },
  ].filter(item => item.value > 0);

  const attendanceRate = stats.totalGuests > 0 
    ? Math.round((stats.attending / stats.totalGuests) * 100) 
    : 0;

  const statCards = [
    {
      title: "Total RSVP",
      value: stats.totalGuests,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Akan Hadir",
      value: stats.attending,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Tidak Hadir",
      value: stats.notAttending,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Belum Pasti",
      value: stats.uncertain,
      icon: HelpCircle,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Total Ucapan",
      value: stats.totalWishes,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-2xl text-gray-800 mb-1">Dashboard</h1>
          <p className="text-gray-600">Overview acara wedding Anda</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-2xl shadow-md p-5 ${
                    index === statCards.length - 1 ? "col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${card.bgColor} rounded-xl p-2.5`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-3xl mb-1 text-gray-900">{card.value}</div>
                  <div className="text-sm text-gray-600">{card.title}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Attendance Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-800">Distribusi Kehadiran</h2>
            {stats.totalGuests > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">{attendanceRate}%</span>
                <span className="text-gray-500">akan hadir</span>
              </div>
            )}
          </div>

          {stats.totalGuests === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data RSVP</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${Math.round(percent * 100)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} tamu`, ""]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/admin/dashboard/guests")}
              className="bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-gray-800 rounded-xl p-4 text-left transition-all"
            >
              <Users className="w-6 h-6 text-rose-600 mb-2" />
              <div className="text-sm">Lihat Tamu</div>
            </button>
            <button
              onClick={() => navigate("/admin/dashboard/wishes")}
              className="bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-gray-800 rounded-xl p-4 text-left transition-all"
            >
              <MessageSquare className="w-6 h-6 text-rose-600 mb-2" />
              <div className="text-sm">Lihat Ucapan</div>
            </button>
          </div>
        </motion.div>

        {/* Refresh Button */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 text-center"
          >
            <button
              onClick={loadStats}
              className="text-sm text-rose-600 hover:text-rose-700 transition-colors"
            >
              🔄 Refresh data
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
