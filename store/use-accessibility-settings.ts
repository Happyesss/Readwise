import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontFamily = "default" | "opendyslexic" | "lexend" | "comicneue";
export type ColorTheme = "default" | "cream" | "green" | "blue" | "gray" | "dark";
export type LineSpacing = "tight" | "normal" | "relaxed" | "loose";
export type LetterSpacing = "tight" | "normal" | "relaxed" | "loose";

interface AccessibilitySettings {
  // Font Settings
  fontFamily: FontFamily;
  fontSize: number; // 12-32px
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
  
  // Color Theme
  colorTheme: ColorTheme;
  customTextColor?: string;
  customBgColor?: string;
  highlightColor: string;
  
  // Reading Aids
  useDyslexicRuler: boolean;
  useTextToSpeech: boolean;
  audioSpeed: number; // 0.5-2.0
  useWordHighlighting: boolean;
  
  // Visual Preferences
  reduceAnimations: boolean;
  increaseContrast: boolean;
  showReadingGuide: boolean;
  
  // Actions
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: number) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setLetterSpacing: (spacing: LetterSpacing) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setHighlightColor: (color: string) => void;
  setUseDyslexicRuler: (use: boolean) => void;
  setUseTextToSpeech: (use: boolean) => void;
  setAudioSpeed: (speed: number) => void;
  setUseWordHighlighting: (use: boolean) => void;
  setReduceAnimations: (reduce: boolean) => void;
  setIncreaseContrast: (increase: boolean) => void;
  setShowReadingGuide: (show: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  fontFamily: "opendyslexic" as FontFamily,
  fontSize: 18,
  lineSpacing: "normal" as LineSpacing,
  letterSpacing: "normal" as LetterSpacing,
  colorTheme: "cream" as ColorTheme,
  highlightColor: "#FFFF00",
  useDyslexicRuler: false,
  useTextToSpeech: true,
  audioSpeed: 1.0,
  useWordHighlighting: false,
  reduceAnimations: false,
  increaseContrast: false,
  showReadingGuide: false,
};

export const useAccessibilitySettings = create<AccessibilitySettings>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineSpacing: (lineSpacing) => set({ lineSpacing }),
      setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setHighlightColor: (highlightColor) => set({ highlightColor }),
      setUseDyslexicRuler: (useDyslexicRuler) => set({ useDyslexicRuler }),
      setUseTextToSpeech: (useTextToSpeech) => set({ useTextToSpeech }),
      setAudioSpeed: (audioSpeed) => set({ audioSpeed }),
      setUseWordHighlighting: (useWordHighlighting) => set({ useWordHighlighting }),
      setReduceAnimations: (reduceAnimations) => set({ reduceAnimations }),
      setIncreaseContrast: (increaseContrast) => set({ increaseContrast }),
      setShowReadingGuide: (showReadingGuide) => set({ showReadingGuide }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: "readwise-accessibility-settings",
    }
  )
);

// Helper function to get font class
export const getFontClass = (font: FontFamily): string => {
  const fontMap: Record<FontFamily, string> = {
    default: "font-sans",
    opendyslexic: "font-opendyslexic",
    lexend: "font-lexend",
    comicneue: "font-comicneue",
  };
  return fontMap[font];
};

// Helper function to get line spacing class
export const getLineSpacingClass = (spacing: LineSpacing): string => {
  const spacingMap: Record<LineSpacing, string> = {
    tight: "leading-dyslexia-tight",
    normal: "leading-dyslexia",
    relaxed: "leading-dyslexia-relaxed",
    loose: "leading-dyslexia-loose",
  };
  return spacingMap[spacing];
};

// Helper function to get letter spacing class
export const getLetterSpacingClass = (spacing: LetterSpacing): string => {
  const spacingMap: Record<LetterSpacing, string> = {
    tight: "tracking-dyslexia-tight",
    normal: "tracking-dyslexia",
    relaxed: "tracking-dyslexia-relaxed",
    loose: "tracking-dyslexia-loose",
  };
  return spacingMap[spacing];
};

// Helper function to get theme colors
export const getThemeColors = (theme: ColorTheme): { bg: string; text: string; accent: string } => {
  const themeMap: Record<ColorTheme, { bg: string; text: string; accent: string }> = {
    default: { bg: "#FFFFFF", text: "#000000", accent: "#1E3A8A" },
    cream: { bg: "#FFF8DC", text: "#000000", accent: "#4A90E2" },
    green: { bg: "#E7F4E4", text: "#1A1A1A", accent: "#2ECC71" },
    blue: { bg: "#E0F2F7", text: "#000033", accent: "#3498DB" },
    gray: { bg: "#F5F5F5", text: "#333333", accent: "#9B59B6" },
    dark: { bg: "#1E1E1E", text: "#E0E0E0", accent: "#60A5FA" },
  };
  return themeMap[theme];
};
