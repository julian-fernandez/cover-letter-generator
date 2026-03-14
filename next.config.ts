import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse and mammoth out of the Next.js bundle so they run
  // as native Node.js modules, avoiding missing browser globals (DOMMatrix, etc.)
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
