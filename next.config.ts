import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase serverless function body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  // Turbopack configuration (Next.js 16 default bundler)
  turbopack: {},

  // Mark Puppeteer packages as server-external so they aren't bundled
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
