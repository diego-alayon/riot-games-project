import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Loaded with Node's require at runtime rather than bundled (the catalog Excel export).
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
