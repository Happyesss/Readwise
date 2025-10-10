"use client";

import { useEffect } from "react";

import { useAccessibilitySettings, getFontClass, getThemeColors } from "@/store/use-accessibility-settings";

/**
 * AccessibilityProvider - Applies accessibility settings to the entire app
 * Place this component high in the component tree (e.g., in layout.tsx)
 */
export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    fontFamily,
    fontSize,
    lineSpacing,
    letterSpacing,
    colorTheme,
    customTextColor,
    customBgColor,
    reduceAnimations,
    increaseContrast,
  } = useAccessibilitySettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font family
    const fontClass = getFontClass(fontFamily);
    root.className = fontClass;
    
    // Apply font size
    root.style.fontSize = `${fontSize}px`;
    
    // Apply line spacing
    const lineSpacingValue = {
      tight: "1.3",
      normal: "1.5",
      relaxed: "1.8",
      loose: "2.0",
    }[lineSpacing];
    root.style.lineHeight = lineSpacingValue;
    
    // Apply letter spacing
    const letterSpacingValue = {
      tight: "0.05em",
      normal: "0.12em",
      relaxed: "0.18em",
      loose: "0.25em",
    }[letterSpacing];
    root.style.letterSpacing = letterSpacingValue;
    
    // Apply color theme
    const colors = getThemeColors(colorTheme);
    root.style.setProperty("--dyslexia-bg", customBgColor || colors.bg);
    root.style.setProperty("--dyslexia-text", customTextColor || colors.text);
    root.style.setProperty("--dyslexia-accent", colors.accent);
    
    // Apply background and text color to body
    document.body.style.backgroundColor = customBgColor || colors.bg;
    document.body.style.color = customTextColor || colors.text;
    
    // Handle reduced motion
    if (reduceAnimations) {
      root.style.setProperty("--animation-duration", "0.01ms");
    } else {
      root.style.setProperty("--animation-duration", "200ms");
    }
    
    // Handle increased contrast
    if (increaseContrast) {
      root.style.setProperty("--contrast-multiplier", "1.2");
    } else {
      root.style.setProperty("--contrast-multiplier", "1.0");
    }
  }, [
    fontFamily,
    fontSize,
    lineSpacing,
    letterSpacing,
    colorTheme,
    customTextColor,
    customBgColor,
    reduceAnimations,
    increaseContrast,
  ]);

  return <>{children}</>;
};
