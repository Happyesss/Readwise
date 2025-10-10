import { AccessibilitySettingsPanel } from "@/components/accessibility/settings-panel";

const AccessibilitySettingsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AccessibilitySettingsPanel />
    </div>
  );
};

export default AccessibilitySettingsPage;
