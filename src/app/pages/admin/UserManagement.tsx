import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Plus, Edit, Trash2, Loader2, Search, Palette } from "lucide-react";
import { useNavigate } from "react-router";
import { getAllUsers, createUser, type User as ApiUser } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface User extends ApiUser {}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      const result = await createUser(newUser);

      if (result.success) {
        toast.success("User berhasil dibuat!");
        setNewUser({ name: "", email: "", password: "" });
        setShowCreateModal(false);
        await loadUsers();
      } else {
        toast.error(result.error || "Gagal membuat user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Gagal membuat user");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl text-gray-800 mb-1">Manajemen User</h1>
              <p className="text-gray-600">Kelola customer wedding invitation</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah User
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Cari user berdasarkan nama atau email..."
            />
          </div>
        </motion.div>

        {/* User Count */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredUsers.length} dari {users.length} user
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        )}

        {/* Users List */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {users.length === 0 ? "Belum ada user" : "Tidak ada user yang sesuai dengan pencarian"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                              <span className="text-rose-600 font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {user.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/admin/dashboard/users/${user.id}/wedding`)}
                              className="text-rose-600 hover:text-rose-900 transition-colors"
                              title="Kelola tema wedding"
                            >
                              <Palette className="w-5 h-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Hapus user"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-rose-600" />
                </div>
                <h2 className="text-2xl text-gray-800 mb-1">Tambah User Baru</h2>
                <p className="text-sm text-gray-600">Buat customer wedding invitation baru</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: Sarah & Michael"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    Buat User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
