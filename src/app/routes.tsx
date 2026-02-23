import { createBrowserRouter } from "react-router";
import { GuestLayout } from "./components/layouts/GuestLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
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
import { NotFound } from "./pages/NotFound";

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
  {
    path: "/admin",
    children: [
      { index: true, Component: AdminLogin },
      {
        path: "dashboard",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "users", Component: UserManagement },
          { path: "guests", Component: GuestList },
          { path: "wishes", Component: WishesManagement },
          { path: "event", Component: EventManagement },
        ],
      },
    ],
  },
  { path: "*", Component: NotFound },
]);
