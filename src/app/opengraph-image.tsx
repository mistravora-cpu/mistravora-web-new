import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mistravora — Software Solutions & Digital Products";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 800,
              color: "white",
            }}
          >
            M
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#e2e8f0" }}>
            Mistravora
          </span>
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#f8fafc",
            maxWidth: "900px",
          }}
        >
          Software Solutions
          <br />
          &amp; Digital Products
        </div>
        <div
          style={{
            marginTop: "24px",
            fontSize: "24px",
            color: "#94a3b8",
            maxWidth: "800px",
          }}
        >
          High-performance web platforms, business software, and AI-powered
          features — built in Sri Lanka, working worldwide.
        </div>
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "12px",
          }}
        >
          <span
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            mistravora.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
