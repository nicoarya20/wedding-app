/**
 * Multi-Tenant Wedding App API
 * Using Supabase Client for browser-compatible database operations
 * 
 * Note: Using Supabase instead of Prisma because:
 * - Prisma Client only works in Node.js/server
 * - This is a client-side React app (no backend)
 * - Supabase works directly in browser
 */

import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../auth";
import { generateUUID } from "../utils/uuid";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== TYPE DEFINITIONS ====================

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  wedding?: Wedding | null; // Include wedding data if exists
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  setupWedding?: boolean;
  weddingSlug?: string;
  weddingDate?: string;
}

export interface Wedding {
  id: string;
  userId: string;
  slug: string;
  coupleName: string;
  weddingDate: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeddingInput {
  userId: string;
  slug: string;
  coupleName: string;
  weddingDate: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface MenuConfig {
  id: string;
  weddingId: string;
  showHome: boolean;
  showDetails: boolean;
  showRsvp: boolean;
  showGallery: boolean;
  showWishes: boolean;
  customOrder: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuConfigInput {
  weddingId: string;
  showHome?: boolean;
  showDetails?: boolean;
  showRsvp?: boolean;
  showGallery?: boolean;
  showWishes?: boolean;
  customOrder?: string;
}

export interface Event {
  id: string;
  weddingId: string;
  type: string;
  date: string;
  time: string;
  location: string;
  address: string;
  mapUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  weddingId: string;
  type: "akad" | "resepsi";
  date: string;
  time: string;
  location: string;
  address: string;
  mapUrl?: string;
  imageUrl?: string;
  order?: number;
}

export interface GalleryPhoto {
  id: string;
  weddingId: string;
  imageUrl: string;
  caption: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateGalleryInput {
  weddingId: string;
  imageUrl: string;
  caption?: string;
  order?: number;
}

export interface Guest {
  id: string;
  weddingId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  attendance: string;
  guestCount: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRSVP {
  weddingId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  attendance: string;
  guestCount?: string | null;
  message?: string | null;
}

export interface Wish {
  id: string;
  weddingId: string | null;
  name: string;
  message: string;
  createdAt: string;
}

export interface SubmitWish {
  weddingId?: string;
  name: string;
  message: string;
}

// ==================== USER APIS ====================

/**
 * Create new user with manual UUID generation
 * Required because Supabase doesn't auto-generate UUIDs
 */
export async function createUser(data: CreateUserInput): Promise<{ 
  success: boolean; 
  userId?: string; 
  weddingId?: string; 
  error?: string;
}> {
  try {
    // Generate UUIDs manually for Supabase
    const userId = generateUUID();
    
    // Hash password before storing
    const hashedPassword = await hashPassword(data.password);

    // Create user with explicit UUID and timestamps
    const now = new Date().toISOString();
    const { data: user, error: userError } = await supabase
      .from("User")
      .insert({
        id: userId,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (userError) throw userError;

    // Auto-create wedding if setupWedding is true
    let weddingId: string | undefined;
    if (data.setupWedding && data.weddingSlug && data.weddingDate) {
      const coupleName = data.name;
      const weddingIdGenerated = generateUUID();

      const { data: wedding, error: weddingError } = await supabase
        .from("Wedding")
        .insert({
          id: weddingIdGenerated,
          userId: user.id,
          slug: data.weddingSlug,
          coupleName: coupleName,
          weddingDate: data.weddingDate,
          theme: "rose",
          primaryColor: "#e11d48",
          secondaryColor: "#ec4899",
          fontFamily: "serif",
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (weddingError) {
        console.error("Error creating wedding:", weddingError);
      } else {
        weddingId = wedding.id;

        // Create default menu config
        await createMenuConfig({ weddingId: wedding.id });

        // Create default events (akad and resepsi)
        const weddingDateObj = new Date(data.weddingDate);
        const formattedDate = weddingDateObj.toISOString().split('T')[0];
        
        const akadId = generateUUID();
        const resepsiId = generateUUID();

        await supabase.from("Event").insert([
          {
            id: akadId,
            weddingId: wedding.id,
            type: "akad",
            date: formattedDate,
            time: "09:00 - 11:00 WIB",
            location: "TBA",
            address: "Lokasi akan ditentukan",
            order: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: resepsiId,
            weddingId: wedding.id,
            type: "resepsi",
            date: formattedDate,
            time: "14:00 - 17:00 WIB",
            location: "TBA",
            address: "Lokasi akan ditentukan",
            order: 1,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }

    return { success: true, userId: user.id, weddingId };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get all users with their wedding data
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("User")
      .select(`
        *,
        Wedding (
          id,
          slug,
          coupleName,
          weddingDate,
          theme,
          primaryColor,
          secondaryColor,
          fontFamily
        )
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Map data to include wedding info
    return (data || []).map(user => ({
      ...user,
      weddingSlug: user.Wedding?.slug || null,
      wedding: user.Wedding || null,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: { name?: string; email?: string; isActive?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("User")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const { error } = await supabase
      .from("User")
      .update({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating user password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Delete user (cascade deletes wedding and related data)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("User")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// ==================== WEDDING APIS ====================

export async function createWedding(data: CreateWeddingInput): Promise<{ 
  success: boolean; 
  weddingId?: string; 
  error?: string;
}> {
  try {
    const weddingId = generateUUID();
    const now = new Date().toISOString();
    
    const { data: wedding, error } = await supabase
      .from("Wedding")
      .insert({
        id: weddingId,
        userId: data.userId,
        slug: data.slug,
        coupleName: data.coupleName,
        weddingDate: data.weddingDate,
        theme: data.theme || "rose",
        primaryColor: data.primaryColor || "#e11d48",
        secondaryColor: data.secondaryColor || "#ec4899",
        fontFamily: data.fontFamily || "serif",
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;

    // Create default menu config
    await createMenuConfig({ weddingId: wedding.id });

    return { success: true, weddingId: wedding.id };
  } catch (error) {
    console.error("Error creating wedding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | null> {
  try {
    const { data, error } = await supabase
      .from("Wedding")
      .select("*")
      .eq("slug", slug)
      .eq("isActive", true)
      .single();

    if (error || !data) return null;

    return data;
  } catch (error) {
    console.error("Error fetching wedding:", error);
    return null;
  }
}

export async function getWeddingByUserId(userId: string): Promise<Wedding | null> {
  try {
    const { data, error } = await supabase
      .from("Wedding")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error || !data) return null;

    return data;
  } catch (error) {
    console.error("Error fetching wedding:", error);
    return null;
  }
}

export interface WeddingData {
  wedding: Wedding;
  events: Event[];
  gallery: GalleryPhoto[];
  menuConfig: MenuConfig | null;
}

export async function getWeddingData(slug: string): Promise<WeddingData | null> {
  try {
    const wedding = await getWeddingBySlug(slug);
    if (!wedding) return null;

    const [events, gallery, menuConfig] = await Promise.all([
      getEventsByWeddingId(wedding.id),
      getGalleryByWeddingId(wedding.id),
      getMenuConfigByWeddingId(wedding.id),
    ]);

    return { wedding, events, gallery, menuConfig };
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return null;
  }
}

export async function updateWeddingTheme(
  weddingId: string,
  theme: string,
  primaryColor: string,
  secondaryColor: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("Wedding")
      .update({ theme, primaryColor, secondaryColor })
      .eq("id", weddingId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating theme:", error);
    return false;
  }
}

// ==================== MENU CONFIG APIS ====================

export async function createMenuConfig(data: CreateMenuConfigInput): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    // Supabase uses camelCase column names (from Prisma schema)
    const { error } = await supabase
      .from("MenuConfig")
      .insert({
        weddingId: data.weddingId,
        showHome: data.showHome ?? true,
        showDetails: data.showDetails ?? true,
        showRsvp: data.showRsvp ?? true,
        showGallery: data.showGallery ?? true,
        showWishes: data.showWishes ?? true,
        customOrder: data.customOrder || "home,details,rsvp,gallery,wishes",
      });

    if (error) {
      console.error("Error creating menu config:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating menu config:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getMenuConfigByWeddingId(weddingId: string): Promise<MenuConfig | null> {
  try {
    const { data, error } = await supabase
      .from("MenuConfig")
      .select("*")
      .eq("weddingId", weddingId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching menu config:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching menu config:", error);
    return null;
  }
}

export async function updateMenuConfig(
  weddingId: string,
  updates: Partial<MenuConfig>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("MenuConfig")
      .update(updates)
      .eq("weddingId", weddingId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating menu config:", error);
    return false;
  }
}

// ==================== EVENT APIS ====================

export async function createEvent(data: CreateEventInput): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from("Event")
      .insert({
        weddingId: data.weddingId,
        type: data.type,
        date: data.date,
        time: data.time,
        location: data.location,
        address: data.address,
        mapUrl: data.mapUrl,
        imageUrl: data.imageUrl,
        order: data.order ?? 0,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getEventsByWeddingId(weddingId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("Event")
      .select("*")
      .eq("weddingId", weddingId)
      .eq("isActive", true)
      .order("order", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("Event")
      .update(updates)
      .eq("id", eventId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    return false;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("Event")
      .delete()
      .eq("id", eventId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}

// ==================== GALLERY APIS ====================

export async function createGalleryPhoto(data: CreateGalleryInput): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from("Gallery")
      .insert({
        weddingId: data.weddingId,
        imageUrl: data.imageUrl,
        caption: data.caption,
        order: data.order ?? 0,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error creating gallery photo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getGalleryByWeddingId(weddingId: string): Promise<GalleryPhoto[]> {
  try {
    const { data, error } = await supabase
      .from("Gallery")
      .select("*")
      .eq("weddingId", weddingId)
      .eq("isActive", true)
      .order("order", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}

export async function deleteGalleryPhoto(photoId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("Gallery")
      .delete()
      .eq("id", photoId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting gallery photo:", error);
    return false;
  }
}

// ==================== GUEST & WISH APIS ====================

export async function submitRSVP(data: SubmitRSVP): Promise<{ 
  success: boolean; 
  error?: string;
}> {
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
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getGuestsByWeddingId(weddingId: string): Promise<Guest[]> {
  try {
    const { data, error } = await supabase
      .from("Guest")
      .select("*")
      .eq("weddingId", weddingId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

export async function submitWish(data: SubmitWish): Promise<{ 
  success: boolean; 
  error?: string;
}> {
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
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getWishesByWeddingId(weddingId: string): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from("Wish")
      .select("*")
      .eq("weddingId", weddingId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return data || [];
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

// ==================== ADMIN APIS ====================

export async function getAdminByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from("Admin")
      .select("*")
      .eq("username", username)
      .single();

    if (error) return null;

    return data;
  } catch (error) {
    console.error("Error fetching admin:", error);
    return null;
  }
}

/**
 * Get first active wedding from active user (for homepage redirect)
 */
export async function getFirstActiveWedding(): Promise<{ slug: string } | null> {
  try {
    // Get wedding from active user, ordered by creation date
    const { data, error } = await supabase
      .from("Wedding")
      .select("slug")
      .eq("isActive", true)
      .order("createdAt", { ascending: true })
      .limit(1)
      .single();

    if (error || !data) return null;
    return { slug: data.slug };
  } catch (error) {
    console.error("Error fetching first wedding:", error);
    return null;
  }
}

/**
 * Get active wedding slug from the currently active user
 * This is used to redirect homepage to the active user's wedding page
 */
export async function getActiveUserWeddingSlug(): Promise<string | null> {
  try {
    // Get the first active user with their wedding
    const { data, error } = await supabase
      .from("User")
      .select(`
        id,
        isActive,
        Wedding (
          id,
          slug,
          isActive
        )
      `)
      .eq("isActive", true)
      .limit(1);

    if (error) {
      console.error("Error fetching active user:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("No active user found");
      return null;
    }

    const user = data[0];
    console.log("Active user found:", user);
    
    // Wedding is returned as an array from Supabase
    const wedding = Array.isArray(user.Wedding) ? user.Wedding[0] : user.Wedding;
    
    // Return the wedding slug if user has an active wedding
    if (wedding && wedding.isActive) {
      console.log("Active wedding slug:", wedding.slug);
      return wedding.slug;
    }
    
    console.log("User has no active wedding");
    return null;
  } catch (error) {
    console.error("Error fetching active user wedding slug:", error);
    return null;
  }
}

export async function createAdmin(data: { 
  username: string; 
  password: string; 
  role?: string;
  userId?: string;
}): Promise<{ success: boolean; admin?: any; error?: string }> {
  try {
    const adminId = generateUUID();
    
    const { data: admin, error } = await supabase
      .from("Admin")
      .insert({
        id: adminId,
        username: data.username,
        password: data.password,
        role: data.role || "admin",
        userId: data.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, admin };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
