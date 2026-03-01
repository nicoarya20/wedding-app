import { useEffect } from "react";
import type { Wedding } from "@/lib/api/multi-tenant";

/**
 * Apply wedding theme colors to CSS custom properties
 */
export function useWeddingTheme(wedding: Wedding | null) {
  useEffect(() => {
    if (!wedding) return;

    const root = document.documentElement;
    
    // Apply theme colors as CSS custom properties
    root.style.setProperty('--theme-primary', wedding.primaryColor);
    root.style.setProperty('--theme-secondary', wedding.secondaryColor);
    
    // Apply gradient based on theme
    const gradient = `linear-gradient(135deg, ${wedding.primaryColor}, ${wedding.secondaryColor})`;
    root.style.setProperty('--theme-gradient', gradient);
    
    // Apply font family
    if (wedding.fontFamily) {
      root.style.setProperty('--theme-font-family', wedding.fontFamily);
    }

    // Cleanup on unmount or wedding change
    return () => {
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-gradient');
      root.style.removeProperty('--theme-font-family');
    };
  }, [wedding]);
}

/**
 * Get theme color styles for inline usage
 */
export function getThemeStyles(wedding: Wedding | null): React.CSSProperties {
  if (!wedding) return {};
  
  return {
    '--theme-primary': wedding.primaryColor,
    '--theme-secondary': wedding.secondaryColor,
    '--theme-gradient': `linear-gradient(135deg, ${wedding.primaryColor}, ${wedding.secondaryColor})`,
  } as React.CSSProperties;
}
