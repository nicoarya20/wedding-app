import { useState, useEffect } from "react";
import { motion, Reorder } from "motion/react";
import { Menu, Save, Loader2, ArrowLeft, GripVertical, Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { 
  getWeddingByUserId,
  getMenuConfigByWeddingId,
  updateMenuConfig,
  type MenuConfig as ApiMenuConfig
} from "@/lib/api/multi-tenant";
import { toast } from "sonner";

interface MenuConfig extends ApiMenuConfig {}

interface MenuItem {
  id: string;
  key: string;
  label: string;
  visible: boolean;
}

const menuItemsTemplate: MenuItem[] = [
  { id: "home", key: "showHome", label: "Home", visible: true },
  { id: "details", key: "showDetails", label: "Detail Acara", visible: true },
  { id: "rsvp", key: "showRsvp", label: "RSVP", visible: true },
  { id: "gallery", key: "showGallery", label: "Galeri", visible: true },
  { id: "wishes", key: "showWishes", label: "Ucapan & Doa", visible: true },
];

export function MenuCustomization() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuItemsTemplate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupleName, setCoupleName] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem("adminLoggedIn")) {
      navigate("/admin");
      return;
    }

    if (userId) {
      loadData(userId);
    }
  }, [userId, navigate]);

  const loadData = async (uid: string) => {
    try {
      setLoading(true);
      
      // Load wedding info
      const wedding = await getWeddingByUserId(uid);
      if (wedding) {
        setCoupleName(wedding.coupleName);
        
        // Load menu config
        const config = await getMenuConfigByWeddingId(wedding.id);
        if (config) {
          setMenuConfig(config);
          // Update menu items visibility based on config
          setMenuItems(menuItemsTemplate.map(item => ({
            ...item,
            visible: config[item.key as keyof MenuConfig] as boolean,
          })));
        }
      } else {
        toast.error("Wedding tidak ditemukan");
        navigate("/admin/dashboard/users");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
      navigate("/admin/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (key: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.key === key ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleSave = async () => {
    if (!menuConfig) return;

    try {
      setSaving(true);
      
      // Build config object from menu items
      const config: Partial<MenuConfig> = {
        showHome: menuItems.find(i => i.key === "showHome")?.visible ?? true,
        showDetails: menuItems.find(i => i.key === "showDetails")?.visible ?? true,
        showRsvp: menuItems.find(i => i.key === "showRsvp")?.visible ?? true,
        showGallery: menuItems.find(i => i.key === "showGallery")?.visible ?? true,
        showWishes: menuItems.find(i => i.key === "showWishes")?.visible ?? true,
        customOrder: menuItems.map(i => i.id).join(","),
      };

      const success = await updateMenuConfig(menuConfig.weddingId, config);

      if (success) {
        toast.success("Menu berhasil disimpan!");
        // Reload to get updated config
        if (userId) {
          await loadData(userId);
        }
      } else {
        toast.error("Gagal menyimpan menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Gagal menyimpan menu");
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
      <div className="max-w-3xl mx-auto">
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
              <h1 className="text-2xl text-gray-800 mb-1">Customize Menu</h1>
              <p className="text-gray-600">{coupleName}</p>
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

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Menu className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Panduan Customize Menu
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Toggle 👁️ untuk show/hide menu</li>
                <li>• Drag & drop untuk ubah urutan menu</li>
                <li>• Urutan akan diterapkan di navigasi guest</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Menu Items List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Urutan & Visibilitas Menu</h2>
          
          <Reorder.Group
            axis="y"
            values={menuItems}
            onReorder={setMenuItems}
            className="space-y-3"
          >
            {menuItems.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="relative"
              >
                <motion.div
                  layout
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    item.visible
                      ? "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Menu Icon & Label */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.visible
                        ? "bg-gradient-to-br from-rose-100 to-pink-100"
                        : "bg-gray-200"
                    }`}>
                      <Menu className={`w-5 h-5 ${
                        item.visible ? "text-rose-600" : "text-gray-400"
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      item.visible ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleVisibility(item.key)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.visible
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={item.visible ? "Hide menu" : "Show menu"}
                  >
                    {item.visible ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 bg-white rounded-2xl shadow-md p-6"
        >
          <h2 className="text-lg text-gray-800 mb-4">Preview Menu Order</h2>
          
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {menuItems.filter(item => item.visible).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm whitespace-nowrap"
                >
                  <span className="text-xs text-gray-500">{index + 1}.</span>
                  <Menu className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              ))}
              {menuItems.filter(item => item.visible).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Tidak ada menu yang visible
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
