/**
 * Admin API using Supabase Client
 * Works in browser environment
 */

import { createClient } from "@supabase/supabase-js";
import { comparePassword, generateToken } from "../auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== TYPE DEFINITIONS ====================

export interface DashboardStats {
  totalGuests: number;
  attending: number;
  notAttending: number;
  uncertain: number;
  totalWishes: number;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  attendance: string;
  guestCount: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface PublicEventData {
  coupleName?: string;
  weddingDate?: string;
  akadTime?: string;
  akadLocation?: string;
  akadAddress?: string;
  resepsiTime?: string;
  resepsiLocation?: string;
  resepsiAddress?: string;
}

export interface EventData {
  id?: string;
  coupleName?: string;
  weddingDate?: string;
  akadTime?: string;
  akadLocation?: string;
  akadAddress?: string;
  resepsiTime?: string;
  resepsiLocation?: string;
  resepsiAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== DASHBOARD APIS ====================

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data: guests, error: guestsError } = await supabase
      .from("Guest")
      .select("attendance");

    if (guestsError) throw guestsError;

    const { count: wishesCount } = await supabase
      .from("Wish")
      .select("*", { count: "exact", head: true });

    const attending = guests?.filter((g) => g.attendance === "hadir").length || 0;
    const notAttending = guests?.filter((g) => g.attendance === "tidak-hadir").length || 0;
    const uncertain = guests?.filter((g) => g.attendance === "belum-pasti").length || 0;

    return {
      totalGuests: guests?.length || 0,
      attending,
      notAttending,
      uncertain,
      totalWishes: wishesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalGuests: 0,
      attending: 0,
      notAttending: 0,
      uncertain: 0,
      totalWishes: 0,
    };
  }
}

// ==================== GUEST APIS ====================

export async function submitRSVP(data: {
  weddingId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  attendance: string;
  guestCount?: string | null;
  message?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("Guest").insert({
      weddingId: data.weddingId || null,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      attendance: data.attendance,
      guestCount: data.attendance === "hadir" ? data.guestCount : null,
      message: data.message || null,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getGuests(searchQuery?: string, filter?: string): Promise<Guest[]> {
  try {
    const { data, error } = await supabase
      .from("Guest")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    let guests = data || [];

    if (searchQuery) {
      guests = guests.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filter && filter !== "all") {
      guests = guests.filter((g) => g.attendance === filter);
    }

    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

// ==================== WISH APIS ====================

export async function submitWish(data: {
  weddingId?: string;
  name: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("Wish").insert({
      weddingId: data.weddingId || null,
      name: data.name,
      message: data.message,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error submitting wish:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWishes(searchQuery?: string): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from("Wish")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    let wishes = data || [];

    if (searchQuery) {
      wishes = wishes.filter(
        (w) =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return wishes;
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return [];
  }
}

export async function deleteWish(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("Wish").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting wish:", error);
    return false;
  }
}

// ==================== EVENT APIS ====================

export async function getPublicEventData(): Promise<PublicEventData | null> {
  try {
    // Fetch first active wedding from active user
    const { data, error } = await supabase
      .from("Wedding")
      .select(`
        coupleName,
        weddingDate,
        Event (
          type,
          time,
          location,
          address
        )
      `)
      .eq("isActive", true)
      .order("createdAt", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data && data.Event) {
      const events = data.Event as any[];
      const akadEvent = events.find((e) => e.type === "akad");
      const resepsiEvent = events.find((e) => e.type === "resepsi");

      return {
        coupleName: data.coupleName,
        weddingDate: data.weddingDate,
        akadTime: akadEvent?.time || "",
        akadLocation: akadEvent?.location || "",
        akadAddress: akadEvent?.address || "",
        resepsiTime: resepsiEvent?.time || "",
        resepsiLocation: resepsiEvent?.location || "",
        resepsiAddress: resepsiEvent?.address || "",
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching public event data:", error);
    return null;
  }
}

export async function getEventData(weddingSlug?: string): Promise<EventData | null> {
  try {
    // If no slug provided, get first active wedding
    const { data: firstWedding } = await supabase
      .from("Wedding")
      .select("slug")
      .eq("isActive", true)
      .order("createdAt", { ascending: true })
      .limit(1)
      .single();
    
    const slug = weddingSlug || firstWedding?.slug || "sarah-michael";
    
    const { data, error } = await supabase
      .from("Wedding")
      .select(`
        coupleName,
        weddingDate,
        Event (
          type,
          time,
          location,
          address
        )
      `)
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data && data.Event) {
      const events = data.Event as any[];
      const akadEvent = events.find((e) => e.type === "akad");
      const resepsiEvent = events.find((e) => e.type === "resepsi");

      return {
        coupleName: data.coupleName,
        weddingDate: data.weddingDate,
        akadTime: akadEvent?.time || "",
        akadLocation: akadEvent?.location || "",
        akadAddress: akadEvent?.address || "",
        resepsiTime: resepsiEvent?.time || "",
        resepsiLocation: resepsiEvent?.location || "",
        resepsiAddress: resepsiEvent?.address || "",
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching event data:", error);
    return null;
  }
}

export async function updateEventData(eventData: EventData, weddingSlug?: string): Promise<boolean> {
  try {
    const slug = weddingSlug || "sarah-michael";

    const { data: wedding, error: weddingError } = await supabase
      .from("Wedding")
      .select("id")
      .eq("slug", slug)
      .single();

    if (weddingError && weddingError.code !== "PGRST116") throw weddingError;

    if (wedding) {
      // Update Wedding table with coupleName and weddingDate
      await supabase
        .from("Wedding")
        .update({
          coupleName: eventData.coupleName,
          weddingDate: eventData.weddingDate,
        })
        .eq("id", wedding.id);

      // Get events for this wedding
      const { data: events } = await supabase
        .from("Event")
        .select("id, type")
        .eq("weddingId", wedding.id);

      if (events && events.length > 0) {
        for (const event of events) {
          if (event.type === "akad") {
            await supabase
              .from("Event")
              .update({
                date: eventData.weddingDate, // Sync date with wedding date
                time: eventData.akadTime,
                location: eventData.akadLocation,
                address: eventData.akadAddress,
              })
              .eq("id", event.id);
          } else if (event.type === "resepsi") {
            await supabase
              .from("Event")
              .update({
                date: eventData.weddingDate, // Sync date with wedding date
                time: eventData.resepsiTime,
                location: eventData.resepsiLocation,
                address: eventData.resepsiAddress,
              })
              .eq("id", event.id);
          }
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating event data:", error);
    return false;
  }
}

/**
 * Get all active weddings for dropdown
 */
export async function getAllWeddings(): Promise<Array<{ id: string; slug: string; coupleName: string }>> {
  try {
    const { data, error } = await supabase
      .from("Wedding")
      .select("id, slug, coupleName")
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching weddings:", error);
    return [];
  }
}

// ==================== ADMIN AUTH APIS ====================

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const { data: admin, error } = await supabase
      .from("Admin")
      .select("id, username, password, role")
      .eq("username", username)
      .single();

    if (error || !admin) {
      return { success: false, error: "Username tidak ditemukan" };
    }

    const isValidPassword = await comparePassword(password, admin.password);

    if (!isValidPassword) {
      return { success: false, error: "Password salah" };
    }

    const token = generateToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    return { success: true, token };
  } catch (error) {
    console.error("Error logging in admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
