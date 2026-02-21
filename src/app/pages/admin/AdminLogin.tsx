import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, User, LogIn } from "lucide-react";
import { toast } from "sonner";

export function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple authentication (dalam production gunakan backend yang aman)
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminLoggedIn", "true");
      toast.success("Login berhasil!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Username atau password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl text-gray-800 mb-1">Admin Panel</h1>
            <p className="text-sm text-gray-600">Masuk untuk mengelola acara wedding</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Masuk
            </button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo:</strong> username: <code>admin</code>, password: <code>admin123</code>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
