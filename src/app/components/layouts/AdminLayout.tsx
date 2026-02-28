import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, MessageSquare, Calendar, LogOut, UserCog, Image } from "lucide-react";
import { removeAuthToken } from "@/lib/auth";
import { toast } from "sonner";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on mount and route change
    const token = localStorage.getItem('adminAuthToken');
    console.log('[AdminLayout] Auth check:', {
      hasToken: !!token,
      tokenPrefix: token?.substring(0, 20),
      pathname: location.pathname,
    });

    if (!token) {
      console.warn('[AdminLayout] No token found, redirecting to login');
      toast.error("Silakan login terlebih dahulu");
      navigate("/admin");
      setIsAuthenticated(false);
      return;
    }

    // Verify token
    try {
      const encoded = token.replace('demo_token_', '');
      const decoded = JSON.parse(atob(encoded));

      if (decoded.exp && decoded.exp < Date.now()) {
        console.warn('[AdminLayout] Token expired, redirecting to login');
        removeAuthToken();
        toast.error("Sesi telah berakhir, silakan login kembali");
        navigate("/admin");
        setIsAuthenticated(false);
        return;
      }

      console.log('[AdminLayout] Token valid, username:', decoded.username);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[AdminLayout] Token verification failed:', error);
      removeAuthToken();
      toast.error("Token tidak valid, silakan login kembali");
      navigate("/admin");
      setIsAuthenticated(false);
    }
  }, [navigate, location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: UserCog, label: "User", path: "/admin/dashboard/users" },
    { icon: Users, label: "Tamu", path: "/admin/dashboard/guests" },
    { icon: MessageSquare, label: "Ucapan", path: "/admin/dashboard/wishes" },
    { icon: Calendar, label: "Acara", path: "/admin/dashboard/event" },
    { icon: Image, label: "Galeri", path: "/admin/dashboard/gallery" },
  ];

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Logout berhasil");
    navigate("/admin");
  };

  // Show nothing while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-semibold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                  isActive ? "text-rose-600" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
