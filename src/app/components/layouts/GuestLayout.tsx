import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation, useParams, useNavigate } from "react-router";
import { Home, Calendar, Image, MessageSquareHeart, CheckSquare } from "lucide-react";
import { getMenuConfigByWeddingId, getWeddingBySlug, type Wedding } from "@/lib/api/multi-tenant";
import type { MenuConfig } from "@/lib/api/multi-tenant";
import { useWeddingTheme } from "@/app/hooks/useWeddingTheme";

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
  key: keyof MenuConfig;
}

export function GuestLayout() {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);

  // Apply theme colors
  useWeddingTheme(wedding);

  // Memoize loadMenuConfig to prevent recreation on every render
  const loadMenuConfig = useCallback(async (weddingSlug: string) => {
    try {
      const weddingData = await getWeddingBySlug(weddingSlug);
      if (weddingData) {
        setWedding(weddingData);
        const config = await getMenuConfigByWeddingId(weddingData.id);
        setMenuConfig(config);
      }
    } catch (error) {
      console.error("Error loading menu config:", error);
    }
  }, []);

  // Memoize loadDefaultWedding
  const loadDefaultWedding = useCallback(async () => {
    try {
      const { data: weddings, error } = await import("@/lib/api/multi-tenant").then(m => m.supabase)
        .then(sb => sb
          .from("Wedding")
          .select("slug")
          .eq("isActive", true)
          .limit(1)
          .single()
        );

      if (weddings?.slug) {
        navigate(`/w/${weddings.slug}`, { replace: true });
        return;
      }
    } catch (_error) {
      console.error("Error loading default wedding");
    }

    setWedding(null);
    setMenuConfig(null);
  }, [navigate]);

  useEffect(() => {
    if (slug) {
      loadMenuConfig(slug);
    } else {
      loadDefaultWedding();
    }
  }, [slug, loadMenuConfig, loadDefaultWedding]);

  const baseNavItems: MenuItem[] = [
    { icon: Home, label: "Home", path: "/", key: "showHome" },
    { icon: Calendar, label: "Acara", path: "/event-details", key: "showDetails" },
    { icon: CheckSquare, label: "RSVP", path: "/rsvp", key: "showRsvp" },
    { icon: Image, label: "Galeri", path: "/gallery", key: "showGallery" },
    { icon: MessageSquareHeart, label: "Ucapan", path: "/wishes", key: "showWishes" },
  ];

  // Filter nav items based on menu config
  const navItems = menuConfig
    ? baseNavItems.filter(item => {
        const configKey = item.key as keyof MenuConfig;
        return menuConfig[configKey] !== false;
      })
    : baseNavItems;

  // Build path with wedding slug if present
  const buildPath = (path: string) => {
    if (!slug) return path;
    if (path === "/") return `/w/${slug}`;
    return `/w/${slug}${path}`;
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: wedding 
          ? `linear-gradient(to bottom, ${wedding.primaryColor}10, ${wedding.secondaryColor}10)`
          : 'linear-gradient(to bottom, from-rose-50 to-pink-50)',
      }}
    >
      <main className={`pb-${navItems.length > 0 ? '20' : '6'}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation - only show if wedding is loaded */}
      {navItems.length > 0 && wedding && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50" 
          style={{ 
            borderColor: wedding ? `${wedding.primaryColor}30` : undefined 
          }}
        >
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const fullPath = buildPath(item.path);
              const isActive = location.pathname === fullPath;

              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors"
                  style={{
                    color: isActive ? (wedding?.primaryColor || '#e11d48') : '#6b7280'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
