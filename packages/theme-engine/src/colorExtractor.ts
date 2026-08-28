import { ExtractedColors, ThemeConfig } from '@sur-o-jhankaar/shared-types';

export class ColorExtractor {
  /**
   * Helper to blend an extracted artwork color with the theme base color
   * ratio: 0.0 uses 100% theme color, 1.0 uses 100% artwork color.
   * Specification §7: Blend artwork colors with playlist theme, never let it fully override.
   */
  public static blendHex(artworkHex: string, themeHex: string, ratio = 0.35): string {
    try {
      const c1 = this.hexToRgb(artworkHex);
      const c2 = this.hexToRgb(themeHex);
      if (!c1 || !c2) return themeHex;

      const r = Math.round(c1.r * ratio + c2.r * (1 - ratio));
      const g = Math.round(c1.g * ratio + c2.g * (1 - ratio));
      const b = Math.round(c1.b * ratio + c2.b * (1 - ratio));

      return this.rgbToHex(r, g, b);
    } catch {
      return themeHex;
    }
  }

  public static applyThemeWithArtwork(theme: ThemeConfig, extracted?: ExtractedColors | null): Record<string, string> {
    if (!extracted) return theme.cssVariables;

    const blendedAccent = this.blendHex(extracted.primary, theme.accentColor, 0.4);
    const blendedGlow = `rgba(${this.hexToRgb(blendedAccent)?.r || 211}, ${this.hexToRgb(blendedAccent)?.g || 155}, ${this.hexToRgb(blendedAccent)?.b || 61}, 0.4)`;

    return {
      ...theme.cssVariables,
      '--accent': blendedAccent,
      '--glow-color': blendedGlow
    };
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      return {
        r: parseInt(cleanHex[0] + cleanHex[0], 16),
        g: parseInt(cleanHex[1] + cleanHex[1], 16),
        b: parseInt(cleanHex[2] + cleanHex[2], 16)
      };
    }
    if (cleanHex.length === 6) {
      return {
        r: parseInt(cleanHex.substring(0, 2), 16),
        g: parseInt(cleanHex.substring(2, 4), 16),
        b: parseInt(cleanHex.substring(4, 6), 16)
      };
    }
    return null;
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
