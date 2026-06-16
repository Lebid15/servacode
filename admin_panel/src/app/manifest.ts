/**
 * =====================================================
 * Web App Manifest
 * =====================================================
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ServaCode Management Console",
    short_name: "ServaCode Admin",
    description: "Management console for company identity, content, project requests, and support",
    start_url: "/ar/admin/login",
    display: "standalone",
    background_color: "#061225",
    theme_color: "#38a8ff",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
