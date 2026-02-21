import { Outlet } from "react-router";
import { Link, useLocation } from "react-router";
import { Home, Calendar, Image, MessageSquareHeart, CheckSquare } from "lucide-react";

export function GuestLayout() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Acara", path: "/event-details" },
    { icon: CheckSquare, label: "RSVP", path: "/rsvp" },
    { icon: Image, label: "Galeri", path: "/gallery" },
    { icon: MessageSquareHeart, label: "Ucapan", path: "/wishes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 shadow-lg z-50">
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
