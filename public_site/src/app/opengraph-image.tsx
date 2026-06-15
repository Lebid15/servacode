/**
 * =====================================================
 * Open Graph Image
 * صورة مشاركة ديناميكية افتراضية
 * =====================================================
 */

import { ImageResponse } from "next/og";

import { siteConfig } from "@/shared/seo/seo-config";

export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "center",
          padding: "76px",
          background: "linear-gradient(135deg, #050b1d 0%, #082f55 52%, #0d766f 100%)",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            background: "rgba(56, 189, 248, 0.32)",
            filter: "blur(20px)"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            background: "rgba(45, 212, 191, 0.24)",
            filter: "blur(20px)"
          }}
        />

        <div
          style={{
            width: "86px",
            height: "86px",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "34px",
            fontSize: "38px",
            fontWeight: 900
          }}
        >
          {"{ }"}
        </div>

        <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.04em" }}>
          {siteConfig.name}
        </div>
        <div style={{ marginTop: 24, maxWidth: 900, fontSize: 32, lineHeight: 1.35, color: "#bdefff" }}>
          Professional Software Systems Studio
        </div>

        <div style={{ display: "flex", gap: "14px", marginTop: "48px" }}>
          {["Web Apps", "Management Dashboards", "Desktop Software", "APIs"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                borderRadius: "999px",
                padding: "12px 18px",
                fontSize: "20px",
                fontWeight: 700
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
