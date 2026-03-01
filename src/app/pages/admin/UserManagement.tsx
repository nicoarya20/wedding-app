import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Plus, Edit, Trash2, Loader2, Search, Palette, Calendar, ToggleLeft, ToggleRight, X, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { getAllUsers, createUser, updateUser, deleteUser, type User as ApiUser } from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface User extends ApiUser {
  weddingSlug?: string | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWeddingWizard, setShowWeddingWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    isActive: true,
  });

  const [newWedding, setNewWedding] = useState({
    slug: "",
    weddingDate: "",
  });

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminAuthToken")) {
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
        setNewUserId(result.userId || null);
        setShowWeddingWizard(true); // Show wedding setup wizard
        await loadUsers();
      } else {
        toast.error(result.error || "Gagal membuat user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Gagal membuat user");
    }
  };

  const handleSetupWedding = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWedding.slug || !newWedding.weddingDate || !newUserId) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      const { createWedding } = await import("@/lib/api/multi-tenant");

      // Generate couple name from user name
      const user = users.find(u => u.id === newUserId);
      const coupleName = user?.name || "Couple";

      const result = await createWedding({
        userId: newUserId,
        slug: newWedding.slug.toLowerCase().replace(/\s+/g, '-'),
        coupleName: coupleName,
        weddingDate: newWedding.weddingDate,
      });

      if (result.success) {
        toast.success("Wedding berhasil dibuat! Sekarang bisa customize tema dan menu.");
        setNewWedding({ slug: "", weddingDate: "" });
        setShowWeddingWizard(false);
        setNewUserId(null);
        // Navigate to theme customization
        navigate(`/admin/dashboard/users/${newUserId}/wedding/theme`);
      } else {
        toast.error(result.error || "Gagal membuat wedding");
      }
    } catch (error) {
      console.error("Error creating wedding:", error);
      toast.error("Gagal membuat wedding");
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await updateUser(userId, { isActive: !currentStatus });

      if (result.success) {
        toast.success(`User berhasil ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`);
        await loadUsers();
      } else {
        toast.error(result.error || "Gagal mengubah status user");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Gagal mengubah status user");
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !editUser.name || !editUser.email) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      const result = await updateUser(selectedUser.id, {
        name: editUser.name,
        email: editUser.email,
        isActive: editUser.isActive,
      });

      if (result.success) {
        toast.success("User berhasil diupdate!");
        setShowEditModal(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        toast.error(result.error || "Gagal mengupdate user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Gagal mengupdate user");
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        toast.success("User berhasil dihapus!");
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        toast.error(result.error || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
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
          
          {/* Workflow Info */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Workflow Manajemen Wedding</h3>
            <div className="flex items-center gap-4 text-xs text-blue-800 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="font-semibold">1.</span>
                <span>Tambah User</span>
              </div>
              <div className="text-blue-400">→</div>
              <div className="flex items-center gap-1">
                <Palette className="w-3 h-3" />
                <span>Customize Tema</span>
              </div>
              <div className="text-blue-400">→</div>
              <div className="flex items-center gap-1">
                <Menu className="w-3 h-3" />
                <span>Customize Menu</span>
              </div>
              <div className="text-blue-400">→</div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Setup Events</span>
              </div>
            </div>
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
                            <a
                              href={`/w/${user.weddingSlug || '#'}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Lihat Wedding Page"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              onClick={() => navigate(`/admin/dashboard/users/${user.id}/wedding/theme`)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Kelola tema wedding"
                            >
                              <Palette className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/dashboard/users/${user.id}/wedding/menu`)}
                              className="text-orange-600 hover:text-orange-900 transition-colors"
                              title="Kelola menu wedding"
                            >
                              <Menu className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user.id, user.isActive)}
                              className={`${
                                user.isActive
                                  ? "text-green-600 hover:text-green-900"
                                  : "text-gray-400 hover:text-gray-600"
                              } transition-colors`}
                              title={user.isActive ? "Nonaktifkan user" : "Aktifkan user"}
                            >
                              {user.isActive ? (
                                <ToggleRight className="w-6 h-6" />
                              ) : (
                                <ToggleLeft className="w-6 h-6" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditClick(user)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
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

        {/* Wedding Setup Wizard Modal */}
        {showWeddingWizard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-rose-600" />
                </div>
                <h2 className="text-2xl text-gray-800 mb-1">Setup Wedding</h2>
                <p className="text-sm text-gray-600">Lengkapi detail wedding invitation</p>
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Slug akan menjadi URL unik untuk wedding page.
                  <br />
                  Contoh: <code className="bg-blue-100 px-2 py-0.5 rounded">sarah-michael</code> →
                  <code className="bg-blue-100 px-2 py-0.5 rounded ml-1">/w/sarah-michael</code>
                </p>
              </div>

              <form onSubmit={handleSetupWedding} className="space-y-4">
                <div>
                  <label htmlFor="slug" className="block text-sm text-gray-700 mb-2">
                    Wedding Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={newWedding.slug}
                    onChange={(e) => setNewWedding({ ...newWedding, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="sarah-michael"
                    pattern="[a-z0-9-]+"
                    title="Gunakan huruf kecil, angka, dan tanda hubung saja"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="weddingDate" className="block text-sm text-gray-700 mb-2">
                    Tanggal Wedding <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="weddingDate"
                    value={newWedding.weddingDate}
                    onChange={(e) => setNewWedding({ ...newWedding, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWeddingWizard(false);
                      setNewUserId(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Lewati
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    Buat Wedding
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <h2 className="text-2xl text-gray-800 mb-1">Edit User</h2>
                  <p className="text-sm text-gray-600">Update informasi user</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm text-gray-700 mb-2">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Contoh: Sarah & Michael"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block text-sm text-gray-700 mb-2">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-status" className="block text-sm text-gray-700 mb-2">
                    Status Akun
                  </label>
                  <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl">
                    {editUser.isActive ? (
                      <ToggleRight className="w-8 h-8 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {editUser.isActive ? "Aktif" : "Nonaktif"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {editUser.isActive 
                          ? "User dapat login dan mengelola wedding" 
                          : "User tidak dapat login"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditUser({ ...editUser, isActive: !editUser.isActive })}
                      className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                    >
                      {editUser.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl text-gray-800 mb-2">Hapus User?</h2>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin menghapus user <strong className="text-gray-900">{selectedUser.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-red-800">
                    ⚠️ <strong>Peringatan:</strong> Tindakan ini akan menghapus semua data wedding, events, gallery, dan RSVP yang terkait.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                >
                  Hapus User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
