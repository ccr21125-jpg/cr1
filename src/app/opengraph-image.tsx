import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/content";

export const alt = `${siteConfig.name} — Piattaforma per i mercati crypto`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Immagine Open Graph generata a build time (segnaposto con i colori del brand). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#050807",
          color: "#e6edea",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0d1512", border: "2px solid #274036", display: "flex" }} />
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>Il futuro delle crypto è qui.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#7f9189", maxWidth: 900 }}>{siteConfig.description}</div>
        </div>
        <div style={{ height: 4, width: 240, background: "#67e3ae", borderRadius: 2 }} />
      </div>
    ),
    size,
  );
}
