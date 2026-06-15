/**
 * =====================================================
 * Open Graph Image
 * صورة مشاركة ديناميكية افتراضية
 * =====================================================
 */

import { ImageResponse } from "next/og";

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
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #061225, #0b3b5f)",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 900 }}>Software Studio</div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#9bdcff" }}>
          Management Console
        </div>
        <div style={{ marginTop: 48, width: 180, height: 10, borderRadius: 999, background: "#38a8ff" }} />
      </div>
    ),
    {
      ...size
    }
  );
}
