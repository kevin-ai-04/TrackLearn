import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackLearn",
    short_name: "TrackLearn",
    description: "A study platform with downloadable course reading and synced progress.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
  };
}
