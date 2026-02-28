import { createBrowserRouter, useParams } from "react-router";
import { GuestLayout } from "./components/layouts/GuestLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/guest/Home";
import { EventDetails } from "./pages/guest/EventDetails";
import { RSVP } from "./pages/guest/RSVP";
import { Gallery } from "./pages/guest/Gallery";
import { Wishes } from "./pages/guest/Wishes";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { GuestList } from "./pages/admin/GuestList";
import { WishesManagement } from "./pages/admin/WishesManagement";
import { EventManagement } from "./pages/admin/EventManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { ThemeCustomization } from "./pages/admin/ThemeCustomization";
import { MenuCustomization } from "./pages/admin/MenuCustomization";
import { GalleryManagement } from "./pages/admin/GalleryManagement";
import { NotFound } from "./pages/NotFound";

// Wrapper component for wedding-specific routes
function WeddingRoutes(Component: any) {
  return function WeddingRouteWrapper() {
    const { slug } = useParams<{ slug: string }>();
    return <Component weddingSlug={slug} />;
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: GuestLayout,
    children: [
      { index: true, Component: Home },
      { path: "event-details", Component: EventDetails },
      { path: "rsvp", Component: RSVP },
      { path: "gallery", Component: Gallery },
      { path: "wishes", Component: Wishes },
    ],
  },
  // Multi-tenant wedding routes
  {
    path: "/w/:slug",
    Component: GuestLayout,
    children: [
      { index: true, Component: WeddingRoutes(Home) },
      { path: "event-details", Component: WeddingRoutes(EventDetails) },
      { path: "rsvp", Component: WeddingRoutes(RSVP) },
      { path: "gallery", Component: WeddingRoutes(Gallery) },
      { path: "wishes", Component: WeddingRoutes(Wishes) },
    ],
  },
  {
    path: "/admin",
    children: [
      { index: true, Component: AdminLogin },
      {
        path: "dashboard",
        Component: () => (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminDashboard },
          { path: "users", Component: UserManagement },
          { path: "users/:userId/wedding/theme", Component: ThemeCustomization },
          { path: "users/:userId/wedding/menu", Component: MenuCustomization },
          { path: "guests", Component: GuestList },
          { path: "wishes", Component: WishesManagement },
          { path: "event", Component: EventManagement },
          { path: "gallery", Component: GalleryManagement },
        ],
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
