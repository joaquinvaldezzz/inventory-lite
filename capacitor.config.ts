import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.inventorylite.app",
  appName: "Inventory Lite",
  webDir: "dist",
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
