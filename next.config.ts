import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  experimental: {
    // Les photos sont compressées côté navigateur, mais une micro-vidéo
    // de 15 secondes reste volumineuse.
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
