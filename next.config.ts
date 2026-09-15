import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // AVIF first: smaller than WebP for photographic content (the practice
    // photos on /, /contact, /services). Browsers that don't support it get
    // Next's existing WebP output automatically — this only adds a smaller
    // option ahead of it, nothing is removed.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Allergy care is not offered; the page was removed on 2026-09-15.
      { source: "/services/allergy", destination: "/services", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
