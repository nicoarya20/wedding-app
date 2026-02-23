import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Palette, Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { 
  getWeddingByUserId, 
  updateWeddingTheme, 
  type Wedding 
} from "@/lib/api/multi-tenant";
import { toast } from "sonner";

// Theme presets
const themePresets = [
  {
    id: "rose",
    name: "Rose Pink",
    primary: "#e11d48",
    secondary: "#ec4899",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "green",
    name: "Emerald Green",
    primary: "#059669",
    secondary: "#10b981",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "blue",
    name: "Ocean Blue",
    primary: "#0284c7",
    secondary: "#38bdf8",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#7c3aed",
    secondary: "#a855f7",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    id: "gold",
    name: "Luxury Gold",
    primary: "#b45309",
    secondary: "#f59e0b",
    gradient: "from-amber-600 to-yellow-500",
  },
  {
    id: "red",
    name: "Classic Red",
    primary: "#dc2626",
    secondary: "#ef4444",
    gradient: "from-red-600 to-red-400",
  },
  {
    id: "teal",
    name: "Teal Mint",
    primary: "#0d9488",
    secondary: "#14b8a6",
    gradient: "from-teal-600 to-cyan-500",
  },
  {
    id: "indigo",
    name: "Deep Indigo",
    primary: "#4f46e5",
    secondary: "#6366f1",
    gradient: "from-indigo-600 to-blue-500",
  },
];

const fontOptions = [
  { value: "serif", label: "Serif (Classic)" },
  { value: "sans-serif", label: "Sans Serif (Modern)" },
  { value: "monospace", label: "Monospace (Minimal)" },
];

export function ThemeCustomization() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("rose");
  const [customPrimary, setCustomPrimary] = useState("#e11d48");
  const [customSecondary, setCustomSecondary] = useState("#ec4899");
  const [selectedFont, setSelectedFont] = useState("serif");

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    if (userId) {
      loadWedding(userId);
    }
  }, [userId, navigate]);

  const loadWedding = async (uid: string) => {
    try {
      setLoading(true);
      const data = await getWeddingByUserId(uid);
      
      if (data) {
        setWedding(data);
        setSelectedTheme(data.theme);
        setCustomPrimary(data.primaryColor);
        setCustomSecondary(data.secondaryColor);
        setSelectedFont(data.fontFamily);
      } else {
        toast.error("Wedding tidak ditemukan");
        navigate("/admin/dashboard/users");
      }
    } catch (error) {
      console.error("Error loading wedding:", error);
      toast.error("Gagal memuat data wedding");
      navigate("/admin/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    const preset = themePresets.find((t) => t.id === themeId);
    if (preset) {
      setCustomPrimary(preset.primary);
      setCustomSecondary(preset.secondary);
    }
  };

  const handleSave = async () => {
    if (!wedding) return;

    try {
      setSaving(true);
      const success = await updateWeddingTheme(
        wedding.id,
        selectedTheme,
        customPrimary,
        customSecondary
      );

      if (success) {
        toast.success("Tema berhasil disimpan!");
        // Reload to get updated data
        await loadWedding(wedding.userId);
      } else {
        toast.error("Gagal menyimpan tema");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Gagal menyimpan tema");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="ml-2 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/admin/dashboard/users")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-800 mb-1">Customize Tema</h1>
              <p className="text-gray-600">
                {wedding?.coupleName || "Loading..."}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Theme Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <h2 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-600" />
            Preview Tema
          </h2>
          
          <div className={`h-32 rounded-xl bg-gradient-to-r ${
            themePresets.find(t => t.id === selectedTheme)?.gradient || "from-rose-500 to-pink-500"
          } flex items-center justify-center`}>
            <div className="text-center text-white">
              <p className="text-sm opacity-90 mb-1">Preview</p>
              <p className="text-2xl font-bold">{wedding?.coupleName || "Couple Name"}</p>
            </div>
          </div>
        </motion.div>

        {/* Theme Presets */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Pilih Tema Warna</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themePresets.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`relative rounded-xl overflow-hidden h-24 transition-all ${
                  selectedTheme === theme.id
                    ? "ring-4 ring-rose-500 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-white text-xs font-semibold drop-shadow-md">
                    {theme.name}
                  </span>
                </div>
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                    <div className="w-3 h-3 bg-rose-500 rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Custom Colors */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Custom Warna (Optional)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Warna Utama
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="#e11d48"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Warna Sekunder
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="#ec4899"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Font Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Font Family</h2>
          
          <div className="space-y-3">
            {fontOptions.map((font) => (
              <label
                key={font.value}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedFont === font.value
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="fontFamily"
                  value={font.value}
                  checked={selectedFont === font.value}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-4 h-4 text-rose-600"
                />
                <span className="flex-1 text-gray-900" style={{ fontFamily: font.value }}>
                  {font.label}
                </span>
                <span className="text-sm text-gray-500" style={{ fontFamily: font.value }}>
                  Aa Bb Cc
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
