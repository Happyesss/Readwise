"use client";

import { useState } from "react";
import { 
  Type, 
  Palette, 
  Volume2, 
  Eye, 
  RotateCcw,
  Settings
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAccessibilitySettings, type FontFamily, type ColorTheme, type LineSpacing, type LetterSpacing } from "@/store/use-accessibility-settings";

export const AccessibilitySettingsPanel = () => {
  const settings = useAccessibilitySettings();
  const [previewText] = useState("The quick brown fox jumps over the lazy dog. Reading should be enjoyable for everyone!");

  const fontOptions: { value: FontFamily; label: string; description: string }[] = [
    { value: "opendyslexic", label: "OpenDyslexic", description: "Designed specifically for dyslexia" },
    { value: "lexend", label: "Lexend", description: "Optimized for readability" },
    { value: "comicneue", label: "Comic Neue", description: "Friendly and approachable" },
    { value: "default", label: "Default", description: "System font" },
  ];

  const colorThemeOptions: { value: ColorTheme; label: string; colors: { bg: string; text: string } }[] = [
    { value: "cream", label: "Cream", colors: { bg: "#FFF8DC", text: "#000000" } },
    { value: "green", label: "Light Green", colors: { bg: "#E7F4E4", text: "#1A1A1A" } },
    { value: "blue", label: "Light Blue", colors: { bg: "#E0F2F7", text: "#000033" } },
    { value: "gray", label: "Gray", colors: { bg: "#F5F5F5", text: "#333333" } },
    { value: "dark", label: "Dark Mode", colors: { bg: "#1E1E1E", text: "#E0E0E0" } },
    { value: "default", label: "White", colors: { bg: "#FFFFFF", text: "#000000" } },
  ];

  const lineSpacingOptions: { value: LineSpacing; label: string }[] = [
    { value: "tight", label: "Tight (1.3x)" },
    { value: "normal", label: "Normal (1.5x)" },
    { value: "relaxed", label: "Relaxed (1.8x)" },
    { value: "loose", label: "Loose (2.0x)" },
  ];

  const letterSpacingOptions: { value: LetterSpacing; label: string }[] = [
    { value: "tight", label: "Tight" },
    { value: "normal", label: "Normal" },
    { value: "relaxed", label: "Relaxed" },
    { value: "loose", label: "Loose" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your reading experience for maximum comfort
          </p>
        </div>
        <Button
          variant="primaryOutline"
          onClick={settings.resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Preview Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>See how your settings look in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg border-2 border-dashed border-blue-300"
            style={{
              fontFamily: settings.fontFamily === "opendyslexic" ? "OpenDyslexic" :
                         settings.fontFamily === "lexend" ? "Lexend" :
                         settings.fontFamily === "comicneue" ? "Comic Neue" : "inherit",
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineSpacing === "tight" ? "1.3" :
                          settings.lineSpacing === "normal" ? "1.5" :
                          settings.lineSpacing === "relaxed" ? "1.8" : "2.0",
              letterSpacing: settings.letterSpacing === "tight" ? "0.05em" :
                            settings.letterSpacing === "normal" ? "0.12em" :
                            settings.letterSpacing === "relaxed" ? "0.18em" : "0.25em",
            }}
          >
            {previewText}
          </div>
        </CardContent>
      </Card>

      {/* Font Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font & Typography
          </CardTitle>
          <CardDescription>
            Choose fonts and spacing optimized for dyslexia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Family */}
          <div className="space-y-3">
            <Label>Font Family</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => settings.setFontFamily(font.value)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all
                    ${settings.fontFamily === font.value 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
                      : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="font-semibold">{font.label}</div>
                  <div className="text-sm text-muted-foreground">{font.description}</div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm font-medium">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) => settings.setFontSize(value[0])}
              min={12}
              max={32}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 16-20px for most users
            </p>
          </div>

          <Separator />

          {/* Line Spacing */}
          <div className="space-y-3">
            <Label>Line Spacing</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {lineSpacingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.lineSpacing === option.value ? "primary" : "primaryOutline"}
                  onClick={() => settings.setLineSpacing(option.value)}
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Letter Spacing */}
          <div className="space-y-3">
            <Label>Letter Spacing</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {letterSpacingOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.letterSpacing === option.value ? "primary" : "primaryOutline"}
                  onClick={() => settings.setLetterSpacing(option.value)}
                  className="w-full"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Theme
          </CardTitle>
          <CardDescription>
            Select a background color that reduces eye strain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colorThemeOptions.map((theme) => (
              <button
                key={theme.value}
                onClick={() => settings.setColorTheme(theme.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${settings.colorTheme === theme.value 
                    ? "border-blue-500 ring-2 ring-blue-200" 
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
                style={{
                  backgroundColor: theme.colors.bg,
                  color: theme.colors.text,
                }}
              >
                <div className="font-semibold">{theme.label}</div>
                <div className="text-xs mt-1 opacity-70">ABC 123</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio & Speech
          </CardTitle>
          <CardDescription>
            Text-to-speech and audio playback preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text to Speech */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">
                Hear words and sentences read aloud
              </p>
            </div>
            <Switch
              checked={settings.useTextToSpeech}
              onCheckedChange={settings.setUseTextToSpeech}
            />
          </div>

          <Separator />

          {/* Audio Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Audio Speed</Label>
              <span className="text-sm font-medium">{settings.audioSpeed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[settings.audioSpeed]}
              onValueChange={(value) => settings.setAudioSpeed(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
              disabled={!settings.useTextToSpeech}
            />
            <p className="text-xs text-muted-foreground">
              Adjust playback speed from 0.5x (slower) to 2.0x (faster)
            </p>
          </div>

          <Separator />

          {/* Word Highlighting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Highlight Words as Read</Label>
              <p className="text-sm text-muted-foreground">
                Visual highlighting during text-to-speech
              </p>
            </div>
            <Switch
              checked={settings.useWordHighlighting}
              onCheckedChange={settings.setUseWordHighlighting}
              disabled={!settings.useTextToSpeech}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Aids */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Reading Aids
          </CardTitle>
          <CardDescription>
            Tools to help focus and reduce visual stress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dyslexic Ruler */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dyslexic Ruler</Label>
              <p className="text-sm text-muted-foreground">
                Overlay that highlights the current line
              </p>
            </div>
            <Switch
              checked={settings.useDyslexicRuler}
              onCheckedChange={settings.setUseDyslexicRuler}
            />
          </div>

          <Separator />

          {/* Reading Guide */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reading Guide</Label>
              <p className="text-sm text-muted-foreground">
                Moving cursor guide for tracking lines
              </p>
            </div>
            <Switch
              checked={settings.showReadingGuide}
              onCheckedChange={settings.setShowReadingGuide}
            />
          </div>

          <Separator />

          {/* Increase Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Increase Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced text visibility
              </p>
            </div>
            <Switch
              checked={settings.increaseContrast}
              onCheckedChange={settings.setIncreaseContrast}
            />
          </div>

          <Separator />

          {/* Reduce Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Animations</Label>
              <p className="text-sm text-muted-foreground">
                Minimize motion and transitions
              </p>
            </div>
            <Switch
              checked={settings.reduceAnimations}
              onCheckedChange={settings.setReduceAnimations}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Notification */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                Settings are saved automatically
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Your preferences will be remembered across sessions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
