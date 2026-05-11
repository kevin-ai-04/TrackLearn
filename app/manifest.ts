import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackLearn",
    short_name: "TrackLearn",
    description: "TrackLearn offline study workspace",
    start_url: "/library",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
  };
}
