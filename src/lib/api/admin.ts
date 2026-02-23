import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalGuests: number;
  attending: number;
  notAttending: number;
  uncertain: number;
  totalWishes: number;
}

/**
 * Fetch dashboard statistics from Supabase
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch guests count by attendance status
    const { data: guests, error: guestsError } = await supabase
      .from("Guest")
      .select("attendance");

    if (guestsError) throw guestsError;

    // Fetch wishes count
    const { count: wishesCount, error: wishesError } = await supabase
      .from("Wish")
      .select("*", { count: "exact", head: true });

    if (wishesError) throw wishesError;

    // Calculate statistics
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
    // Return default values on error
    return {
      totalGuests: 0,
      attending: 0,
      notAttending: 0,
      uncertain: 0,
      totalWishes: 0,
    };
  }
}

/**
 * Submit RSVP (guest-facing)
 */
export interface SubmitRSVP {
  name: string;
  email?: string | null;
  phone?: string | null;
  attendance: string;
  guestCount?: string | null;
  message?: string | null;
}

export async function submitRSVP(data: SubmitRSVP): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("Guest").insert({
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
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch all guests with optional filtering
 */
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

export async function getGuests(searchQuery?: string, filter?: string): Promise<Guest[]> {
  try {
    let query = supabase.from("Guest").select("*").order("createdAt", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    let guests = data || [];

    // Apply search filter
    if (searchQuery) {
      guests = guests.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply attendance filter
    if (filter && filter !== "all") {
      guests = guests.filter((g) => g.attendance === filter);
    }

    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

/**
 * Submit wish (guest-facing)
 */
export interface SubmitWish {
  name: string;
  message: string;
}

export async function submitWish(data: SubmitWish): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("Wish").insert({
      name: data.name,
      message: data.message,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error submitting wish:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch all wishes
 */
export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export async function getWishes(searchQuery?: string): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from("Wish")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    let wishes = data || [];

    // Apply search filter
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

/**
 * Delete a wish
 */
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

/**
 * Fetch event data (public access for guest pages)
 */
export interface PublicEventData {
  coupleName: string;
  weddingDate: string;
  akadTime: string;
  akadLocation: string;
  akadAddress: string;
  resepsiTime: string;
  resepsiLocation: string;
  resepsiAddress: string;
}

export async function getPublicEventData(): Promise<PublicEventData | null> {
  try {
    const { data, error } = await supabase
      .from("Event")
      .select("coupleName, weddingDate, akadTime, akadLocation, akadAddress, resepsiTime, resepsiLocation, resepsiAddress")
      .eq("id", "default")
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found

    return data;
  } catch (error) {
    console.error("Error fetching public event data:", error);
    return null;
  }
}

/**
 * Fetch event data (admin access)
 */
export interface EventData {
  id?: string;
  coupleName: string;
  weddingDate: string;
  akadTime: string;
  akadLocation: string;
  akadAddress: string;
  resepsiTime: string;
  resepsiLocation: string;
  resepsiAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getEventData(): Promise<EventData | null> {
  try {
    const { data, error } = await supabase
      .from("Event")
      .select("*")
      .eq("id", "default")
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found

    return data;
  } catch (error) {
    console.error("Error fetching event data:", error);
    return null;
  }
}

/**
 * Update event data (upsert - update or insert)
 */
export async function updateEventData(eventData: EventData): Promise<boolean> {
  try {
    // Check if event exists
    const existing = await getEventData();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("Event")
        .update({
          coupleName: eventData.coupleName,
          weddingDate: eventData.weddingDate,
          akadTime: eventData.akadTime,
          akadLocation: eventData.akadLocation,
          akadAddress: eventData.akadAddress,
          resepsiTime: eventData.resepsiTime,
          resepsiLocation: eventData.resepsiLocation,
          resepsiAddress: eventData.resepsiAddress,
        })
        .eq("id", "default");

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase.from("Event").insert({
        id: "default",
        coupleName: eventData.coupleName,
        weddingDate: eventData.weddingDate,
        akadTime: eventData.akadTime,
        akadLocation: eventData.akadLocation,
        akadAddress: eventData.akadAddress,
        resepsiTime: eventData.resepsiTime,
        resepsiLocation: eventData.resepsiLocation,
        resepsiAddress: eventData.resepsiAddress,
      });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating event data:", error);
    return false;
  }
}

/**
 * Admin authentication
 */
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("Admin")
      .select("username")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error("Error logging in admin:", error);
    return false;
  }
}
